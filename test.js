const { google } = require('googleapis');
const fs = require('fs');

async function checkSheets() {
    try {
        const envStr = fs.readFileSync('.env.local', 'utf8');
        let sheetsId = '';
        let creds = '';
        envStr.split('\n').forEach(line => {
            if (line.startsWith('GOOGLE_SHEET_ID=')) sheetsId = line.substring('GOOGLE_SHEET_ID='.length).trim();
            if (line.startsWith('GOOGLE_SHEETS_CREDENTIALS=')) creds = line.substring('GOOGLE_SHEETS_CREDENTIALS='.length).trim();
        });

        // Handle possible quotes around the JSON
        if (creds.startsWith("'") && creds.endsWith("'")) creds = creds.slice(1, -1);
        
        const credentials = JSON.parse(creds);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });
        const sheets = google.sheets({ version: 'v4', auth });
        
        const response = await sheets.spreadsheets.get({
            spreadsheetId: sheetsId,
        });
        
        console.log("Available sheets:");
        response.data.sheets.forEach(sheet => {
            console.log(sheet.properties.title);
        });
    } catch (e) {
        console.error(e);
    }
}
checkSheets();
