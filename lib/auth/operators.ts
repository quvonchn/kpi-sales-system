import { google } from 'googleapis';
import bcrypt from 'bcryptjs';

export interface Operator {
    name: string;
    password: string;
    email?: string;
    role?: 'admin' | 'operator';
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
        // Columns: A=Name, B=Password, C=Email, D=Role
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'Лист2!A2:D', // Assuming row 1 is headers
        });

        const rows = response.data.values || [];

        const operators: Operator[] = rows.map((row) => {
            const name = (row[0] || '').toString().trim();
            const role = (row[3] || 'operator').toString().trim().toLowerCase();
            
            return {
                name,
                password: (row[1] || '').toString().trim(),
                email: (row[2] || '').toString().trim(),
                role: (name.toLowerCase() === 'admin' ? 'admin' : role) as 'admin' | 'operator',
            };
        });

        return operators;


    } catch (error) {
        console.error("Error fetching operators:", error);
        return [];
    }
}

export async function validateOperator(name: string, password: string): Promise<Operator | null> {
    const operators = await getOperators();
    const targetName = name.toLowerCase().trim();
    const targetPassword = password.trim();

    const operator = operators.find(op => op.name.toLowerCase() === targetName);
    
    if (!operator) return null;

    // Check if the password is a hash (starts with $2a$ or $2b$)
    const isHash = operator.password.startsWith('$2a$') || operator.password.startsWith('$2b$');

    if (isHash) {
        const isValid = await bcrypt.compare(targetPassword, operator.password);
        return isValid ? operator : null;
    } else {
        // Fallback for plain-text passwords during migration
        const isValid = operator.password === targetPassword;
        if (isValid) {
            // Auto-update to hash if possible
            // updateOperatorPassword(operator.name, targetPassword);
            return operator;
        }
        return null;
    }
}

export async function updateOperatorPassword(name: string, newPassword: string): Promise<boolean> {
    if (!process.env.GOOGLE_SHEETS_CREDENTIALS || !process.env.GOOGLE_SHEET_ID) {
        return false;
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
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
        const range = `Лист2!B${rowIndex + 1}`;

        await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range,
            valueInputOption: 'RAW',
            requestBody: {
                values: [[hashedPassword]],
            },
        });

        return true;
    } catch (error) {
        console.error("Error updating operator password:", error);
        return false;
    }
}

