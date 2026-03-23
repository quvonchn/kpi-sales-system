import { google } from 'googleapis';

export interface SheetSale {
    id: string;
    operator: string;
    salesDate: string;
    commission: string;
    quruvchi: string;
    obyekt: string;
    status: string;
    // For display purposes
    amount: number;
    product: string;
    time: string;
}

export function normalizeDateStr(dateStr: string): string {
    if (!dateStr) return '';
    const dateOnly = dateStr.toString().trim().split(' ')[0];
    
    // Helper to format parts into YYYY-MM-DD
    const formatParts = (parts: string[]) => {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        return `${year}-${month}-${day}`;
    };

    if (dateOnly.includes('.')) {
        const parts = dateOnly.split('.');
        if (parts.length >= 3) return formatParts(parts);
    }
    
    if (dateOnly.includes('/')) {
        const parts = dateOnly.split('/');
        if (parts.length >= 3) return formatParts(parts);
    }

    return dateOnly;
}

export async function getTodaySalesFromSheets(operatorName?: string): Promise<SheetSale[]> {
    if (!process.env.GOOGLE_SHEETS_CREDENTIALS || !process.env.GOOGLE_SHEET_ID) {
        console.warn("Google Sheets credentials missing. Returning empty array.");
        return [];
    }

    try {
        const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // Get current month and year
        const today = new Date();
        const currentMonth = today.getMonth() + 1; // 1-12
        const currentYear = today.getFullYear();

        console.log(`Attempting to fetch sales for operator: ${operatorName || 'All'}, Month: ${currentMonth}, Year: ${currentYear}`);

        // Read data from the sheet
        // Columns: A=ID, B=Operator, C=Sales Date, D=Commission, E=Quruvchi, F=Obyekt, G=Status
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'Лист1!A2:G',
        });

        const rows = response.data.values || [];
        console.log(`Fetched ${rows.length} rows from Google Sheets.`);

        // Filter current month's sales and map to our format
        const sales: SheetSale[] = rows
            .filter((row) => {
                const salesDateStr = row[2];
                if (!salesDateStr) return false;

                const normDate = normalizeDateStr(salesDateStr.toString());
                
                // Parse date (format: 2026-01-05)
                const dateParts = normDate.split('-');
                if (dateParts.length < 2) return false;

                const year = parseInt(dateParts[0]);
                const month = parseInt(dateParts[1]);

                // Filter by current month
                const isCurrentMonth = year === currentYear && month === currentMonth;

                // If operatorName is provided, filter by operator
                const operator = (row[1] || '').toString().toLowerCase().trim();
                const matchesOperator = !operatorName || operator === operatorName.toLowerCase().trim();

                return isCurrentMonth && matchesOperator;
            })
            .map((row) => {
                const salesDateStr = row[2] || '';
                const normDate = normalizeDateStr(salesDateStr.toString());
                const commission = row[3] || '0';

                const displayDate = normDate;

                const commissionAmount = parseFloat(commission.toString().replace(/[^0-9.-]/g, '') || '0');

                return {
                    id: (row[0] || 'N/A').toString(),
                    operator: (row[1] || 'Unknown').toString(),
                    salesDate: normDate,
                    commission: commission.toString(),
                    quruvchi: (row[4] || '').toString(),
                    obyekt: (row[5] || 'Unknown Object').toString(),
                    status: (row[6] || '').toString().toLowerCase().trim(),
                    amount: commissionAmount,
                    product: (row[5] || 'Unknown Object').toString(),
                    time: displayDate.toString(),
                };
            });

        console.log(`Filtered ${sales.length} sales for ${operatorName || 'All'}`);
        return sales;

    } catch (error) {
        console.error("Google Sheets API Error:", error);
        return [];
    }
}

/**
 * Get sales for a specific month and year
 * Used for historical sales analysis
 */
export async function getSalesByMonth(
    operatorName?: string,
    month?: number,
    year?: number
): Promise<SheetSale[]> {
    if (!process.env.GOOGLE_SHEETS_CREDENTIALS || !process.env.GOOGLE_SHEET_ID) {
        console.warn("Google Sheets credentials missing. Returning empty array.");
        return [];
    }

    try {
        const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // Use provided month/year or default to current
        const today = new Date();
        const targetMonth = month ?? (today.getMonth() + 1);
        const targetYear = year ?? today.getFullYear();

        console.log(`Fetching sales for operator: ${operatorName || 'All'}, Month: ${targetMonth}, Year: ${targetYear}`);

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'Лист1!A2:G',
        });

        const rows = response.data.values || [];

        const sales: SheetSale[] = rows
            .filter((row) => {
                const salesDateStr = row[2];
                if (!salesDateStr) return false;

                const normDate = normalizeDateStr(salesDateStr.toString());
                const dateParts = normDate.split('-');
                if (dateParts.length < 2) return false;

                const rowYear = parseInt(dateParts[0]);
                const rowMonth = parseInt(dateParts[1]);

                const matchesMonth = rowYear === targetYear && rowMonth === targetMonth;

                const operator = (row[1] || '').toString().toLowerCase().trim();
                const matchesOperator = !operatorName || operator === operatorName.toLowerCase().trim();

                return matchesMonth && matchesOperator;
            })
            .map((row) => {
                const salesDateStr = row[2] || '';
                const normDate = normalizeDateStr(salesDateStr.toString());
                const commission = row[3] || '0';

                const displayDate = normDate;

                const commissionAmount = parseFloat(commission.toString().replace(/[^0-9.-]/g, '') || '0');

                return {
                    id: (row[0] || 'N/A').toString(),
                    operator: (row[1] || 'Unknown').toString(),
                    salesDate: normDate,
                    commission: commission.toString(),
                    quruvchi: (row[4] || '').toString(),
                    obyekt: (row[5] || 'Unknown Object').toString(),
                    status: (row[6] || '').toString().toLowerCase().trim(),
                    amount: commissionAmount,
                    product: (row[5] || 'Unknown Object').toString(),
                    time: displayDate.toString(),
                };
            });

        console.log(`Fetched ${sales.length} sales for month ${targetMonth}/${targetYear}`);
        return sales;

    } catch (error) {
        console.error("Google Sheets API Error:", error);
        return [];
    }
}

/**
 * Get all sales (optionally filtered by date range).
 * Used for admin advanced filtering.
 */
export async function getSalesByDateRange(
    startDate?: string,
    endDate?: string
): Promise<SheetSale[]> {
    if (!process.env.GOOGLE_SHEETS_CREDENTIALS || !process.env.GOOGLE_SHEET_ID) {
        console.warn("Google Sheets credentials missing. Returning empty array.");
        return [];
    }

    try {
        const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'Лист1!A2:G',
        });

        const rows = response.data.values || [];

        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        // Reset time part for end date to include the whole day if we're comparing
        if (end) {
            end.setHours(23, 59, 59, 999);
        }

        const sales: SheetSale[] = rows
            .filter((row) => {
                const salesDateStr = row[2];
                if (!salesDateStr) return false;

                const normDate = normalizeDateStr(salesDateStr.toString());
                const salesDate = new Date(normDate);

                // If date is invalid, don't include
                if (isNaN(salesDate.getTime())) return false;

                if (start && salesDate < start) return false;
                if (end && salesDate > end) return false;

                return true;
            })
            .map((row) => {
                const salesDateStr = row[2] || '';
                const normDate = normalizeDateStr(salesDateStr.toString());
                const commission = row[3] || '0';

                const displayDate = normDate;

                const commissionAmount = parseFloat(commission.toString().replace(/[^0-9.-]/g, '') || '0');

                return {
                    id: (row[0] || 'N/A').toString(),
                    operator: (row[1] || 'Unknown').toString().trim(),
                    salesDate: normDate,
                    commission: commission.toString(),
                    quruvchi: (row[4] || '').toString().trim(),
                    obyekt: (row[5] || 'Unknown Object').toString(),
                    status: (row[6] || '').toString().toLowerCase().trim(),
                    amount: commissionAmount,
                    product: (row[5] || 'Unknown Object').toString(),
                    time: displayDate.toString(),
                };
            });

        return sales;

    } catch (error) {
        console.error("Google Sheets API Error in getSalesByDateRange:", error);
        return [];
    }
}
