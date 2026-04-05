const { google } = require('googleapis');
const fs = require('fs');

async function testLogin() {
    try {
        const envStr = fs.readFileSync('.env.local', 'utf8');
        let sheetsId = '';
        let creds = '';
        envStr.split('\n').forEach(line => {
            if (line.startsWith('GOOGLE_SHEET_ID=')) sheetsId = line.substring('GOOGLE_SHEET_ID='.length).trim();
            if (line.startsWith('GOOGLE_SHEETS_CREDENTIALS=')) creds = line.substring('GOOGLE_SHEETS_CREDENTIALS='.length).trim();
        });

        if (creds.startsWith("'") && creds.endsWith("'")) creds = creds.slice(1, -1);
        
        const credentials = JSON.parse(creds);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });
        const sheets = google.sheets({ version: 'v4', auth });
        
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetsId,
            range: "'login: parols'!A2:E",
        });
        
        const rows = response.data.values || [];
        console.log("Found rows:", rows.length);
        
        const operators = rows.map((row) => {
            const name = (row[0] || '').toString().trim();
            const role = (row[2] || 'operator').toString().trim().toLowerCase(); // Column C
            
            return {
                name,
                password: (row[1] || '').toString().trim(),
                role: (name.toLowerCase() === 'admin' ? 'admin' : role),
                selectedGoal: (row[3] || '').toString().trim(), // Column D
            };
        });

        console.log(operators.slice(0, 3));
        const muqaddas = operators.find(o => o.name === 'Muqaddas');
        console.log("Admin details:", muqaddas);

    } catch (e) {
        console.error(e);
    }
}
testLogin();
