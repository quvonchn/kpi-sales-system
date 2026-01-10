import { google } from 'googleapis';

export interface Operator {
    name: string;
    password: string;
    email?: string;
}

export async function getOperators(): Promise<Operator[]> {
    if (!process.env.GOOGLE_SHEETS_CREDENTIALS || !process.env.GOOGLE_SHEET_ID) {
        console.warn("Google Sheets credentials missing.");
        return [];
    }

    try {
        const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'], // Changed to allow writing
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // Read from "Лист2" sheet (User's sheet for operators)
        // Columns: A=Name, B=Password, C=Email (optional)
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'Лист2!A2:C', // Assuming row 1 is headers
        });

        const rows = response.data.values || [];

        const operators: Operator[] = rows.map((row) => ({
            name: (row[0] || '').toString().trim(),
            password: (row[1] || '').toString().trim(),
            email: (row[2] || '').toString().trim(),
        }));

        return operators;

    } catch (error) {
        console.error("Error fetching operators:", error);
        return [];
    }
}

export async function validateOperator(name: string, password: string): Promise<boolean> {
    const operators = await getOperators();
    const targetName = name.toLowerCase().trim();
    const targetPassword = password.trim();

    return operators.some(op =>
        op.name.toLowerCase() === targetName &&
        op.password === targetPassword
    );
}

export async function updateOperatorPassword(name: string, newPassword: string): Promise<boolean> {
    if (!process.env.GOOGLE_SHEETS_CREDENTIALS || !process.env.GOOGLE_SHEET_ID) {
        return false;
    }

    try {
        const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        const sheets = google.sheets({ version: 'v4', auth });

        // 1. Find the row index for the operator
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'Лист2!A1:A', // Read only column A
        });

        const rows = response.data.values || [];
        const rowIndex = rows.findIndex(row =>
            row[0]?.toString().toLowerCase().trim() === name.toLowerCase().trim()
        );

        if (rowIndex === -1) {
            console.error(`Operator ${name} not found in sheet`);
            return false;
        }

        // 2. Update the password cell (Column B = index 1)
        // In Google Sheets API, range is 1-indexed, but rowIndex from findIndex is 0-indexed.
        // So cell is B[rowIndex + 1]. 
        const range = `Лист2!B${rowIndex + 1}`;

        await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range,
            valueInputOption: 'RAW',
            requestBody: {
                values: [[newPassword]],
            },
        });

        return true;
    } catch (error) {
        console.error("Error updating operator password:", error);
        return false;
    }
}
