const { google } = require('googleapis');
const fs = require('fs');
const key = JSON.parse(fs.readFileSync('/app/config/service-account.json','utf8'));
const auth = new google.auth.JWT({ email: key.client_email, key: key.private_key, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
const sheets = google.sheets({ version: 'v4', auth });

async function main() {
  // Get all sheet names first
  const meta = await sheets.spreadsheets.get({ spreadsheetId: '1Zhh7klMyT7l8nKKtWhz6bU6mGrtvkoXXfevZdbhIeIw' });
  const sheetNames = meta.data.sheets.map(s => s.properties.title);
  console.log('SHEETS:', JSON.stringify(sheetNames));

  // Read headers + 2 rows from each sheet
  for (const name of sheetNames) {
    try {
      const r = await sheets.spreadsheets.values.get({
        spreadsheetId: '1Zhh7klMyT7l8nKKtWhz6bU6mGrtvkoXXfevZdbhIeIw',
        range: `'${name}'!A1:Z3`,
      });
      console.log(`\n=== ${name} ===`);
      console.log('Headers:', JSON.stringify(r.data.values?.[0]));
      if (r.data.values?.[1]) console.log('Row 1:', JSON.stringify(r.data.values[1]));
    } catch(e) { console.log(`${name}: ERROR - ${e.message}`); }
  }
}
main().catch(e => console.error(e));
