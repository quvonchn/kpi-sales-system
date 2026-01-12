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
                const salesDate = row[2]; // Sales Date column (C)
                if (!salesDate) return false;

                // Parse date (format: 2026-01-05)
                const dateParts = salesDate.toString().split('-');
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
                const salesDate = row[2] || '';
                const commission = row[3] || '0';

                const displayDate = salesDate.includes(' ')
                    ? salesDate.split(' ')[0]
                    : salesDate;

                const commissionAmount = parseFloat(commission.toString().replace(/[^0-9.-]/g, '') || '0');

                return {
                    id: (row[0] || 'N/A').toString(),
                    operator: (row[1] || 'Unknown').toString(),
                    salesDate: salesDate.toString(),
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

export async function getMonthlySalesCount(operatorName: string): Promise<number> {
    const sales = await getTodaySalesFromSheets(operatorName);
    return sales.length;
}

export async function getMonthlyCommission(operatorName: string): Promise<number> {
    const sales = await getTodaySalesFromSheets(operatorName);
    return sales.reduce((sum, sale) => sum + sale.amount, 0);
}
