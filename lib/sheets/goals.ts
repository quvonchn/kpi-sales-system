import { google } from 'googleapis';

export interface GoalHistoryEntry {
    rowIndex: number;       // For update operations
    operatorId: string;     // A
    operatorName: string;   // B
    goalId: string;         // C
    goalName: string;       // D
    priceUzs: number;       // E
    imageUrl: string;       // F
    setAt: string;          // G — ISO date string
    status: 'active' | 'achieved' | 'failed'; // H
    resolvedAt?: string;    // I
}

function getAuth() {
    const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS!);
    return new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
}

// Append a new goal entry to the `goals` sheet
export async function appendGoalHistory(
    operatorId: string,
    operatorName: string,
    goal: { id: string; name: string; priceUzs: number; imageUrl: string }
): Promise<boolean> {
    if (!process.env.GOOGLE_SHEETS_CREDENTIALS || !process.env.GOOGLE_SHEET_ID) return false;

    try {
        const auth = getAuth();
        const sheets = google.sheets({ version: 'v4', auth });

        const now = new Date().toISOString();

        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'goals!A:I',
            valueInputOption: 'RAW',
            requestBody: {
                values: [[
                    operatorId,      // A
                    operatorName,    // B
                    goal.id,         // C
                    goal.name,       // D
                    goal.priceUzs,   // E
                    goal.imageUrl,   // F
                    now,             // G - set_at
                    'active',        // H - status
                    '',              // I - resolved_at
                ]],
            },
        });

        return true;
    } catch (error) {
        console.error('Error appending goal history:', error);
        return false;
    }
}

// Get all goal history entries for an operator
export async function getGoalHistory(operatorId: string): Promise<GoalHistoryEntry[]> {
    if (!process.env.GOOGLE_SHEETS_CREDENTIALS || !process.env.GOOGLE_SHEET_ID) return [];

    try {
        const auth = getAuth();
        const sheets = google.sheets({ version: 'v4', auth });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'goals!A2:I',
        });

        const rows = response.data.values || [];

        return rows
            .map((row, idx) => ({
                rowIndex: idx + 2, // +2 because A2 is row index 2
                operatorId: (row[0] || '').toString(),
                operatorName: (row[1] || '').toString(),
                goalId: (row[2] || '').toString(),
                goalName: (row[3] || '').toString(),
                priceUzs: Number(row[4]) || 0,
                imageUrl: (row[5] || '').toString(),
                setAt: (row[6] || '').toString(),
                status: ((row[7] || 'active') as GoalHistoryEntry['status']),
                resolvedAt: (row[8] || '').toString(),
            }))
            .filter(entry => entry.operatorId === operatorId);
    } catch (error) {
        console.error('Error fetching goal history:', error);
        return [];
    }
}

// Update the status of a specific goal entry
export async function updateGoalStatus(
    rowIndex: number,
    status: 'achieved' | 'failed'
): Promise<boolean> {
    if (!process.env.GOOGLE_SHEETS_CREDENTIALS || !process.env.GOOGLE_SHEET_ID) return false;

    try {
        const auth = getAuth();
        const sheets = google.sheets({ version: 'v4', auth });
        const resolvedAt = new Date().toISOString();

        await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: `goals!H${rowIndex}:I${rowIndex}`,
            valueInputOption: 'RAW',
            requestBody: {
                values: [[status, resolvedAt]],
            },
        });

        return true;
    } catch (error) {
        console.error('Error updating goal status:', error);
        return false;
    }
}
