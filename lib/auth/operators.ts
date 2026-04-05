import { google } from 'googleapis';
import bcrypt from 'bcryptjs';

export interface Operator {
    id?: string;        // Column A
    name: string;       // Column B
    password: string;   // Column C
    role?: 'admin' | 'operator'; // Column D
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
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // Columns: A=ID, B=Ism, C=Parol, D=Rol
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: "'login: parols'!A2:D",
        });

        const rows = response.data.values || [];

        const operators: Operator[] = rows.map((row) => {
            const id   = (row[0] || '').toString().trim();  // A
            const name = (row[1] || '').toString().trim();  // B
            const role = (row[3] || 'operator').toString().trim().toLowerCase(); // D

            return {
                id,
                name,
                password: (row[2] || '').toString().trim(),  // C
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

    console.log(`[DEBUG] Attempting login. targetName: "${targetName}", foundOp:`, operator?.name);

    if (!operator) return null;

    const isHash = operator.password.startsWith('$2a$') || operator.password.startsWith('$2b$');

    if (isHash) {
        const isValid = await bcrypt.compare(targetPassword, operator.password);
        return isValid ? operator : null;
    } else {
        const isValid = operator.password === targetPassword;
        return isValid ? operator : null;
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

        // Find row by name (Column B)
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: "'login: parols'!B1:B",
        });

        const rows = response.data.values || [];
        const rowIndex = rows.findIndex(row =>
            row[0]?.toString().toLowerCase().trim() === name.toLowerCase().trim()
        );

        if (rowIndex === -1) return false;

        // Update Column C (password)
        await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: `'login: parols'!C${rowIndex + 1}`,
            valueInputOption: 'RAW',
            requestBody: { values: [[hashedPassword]] },
        });

        return true;
    } catch (error) {
        console.error("Error updating operator password:", error);
        return false;
    }
}

export async function updateOperatorGoal(name: string, goalData: string): Promise<boolean> {
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

        // Find row by name (Column B)
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: "'login: parols'!B1:B",
        });

        const rows = response.data.values || [];
        const rowIndex = rows.findIndex(row =>
            row[0]?.toString().toLowerCase().trim() === name.toLowerCase().trim()
        );

        if (rowIndex === -1) {
            console.error(`Operator ${name} not found in sheet`);
            return false;
        }

        // Update Column E (selectedGoal)
        await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: `'login: parols'!E${rowIndex + 1}`,
            valueInputOption: 'RAW',
            requestBody: { values: [[goalData]] },
        });

        return true;
    } catch (error) {
        console.error("Error updating operator goal:", error);
        return false;
    }
}
