const { google } = require('googleapis');
const fs = require('fs');
const key = JSON.parse(fs.readFileSync('/app/config/service-account.json','utf8'));
const auth = new google.auth.JWT({ email: key.client_email, key: key.private_key, scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
const sheets = google.sheets({ version: 'v4', auth });

async function readHeaders(id, label) {
  try {
    const r = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: 'A1:Z3' });
    console.log(`\n=== ${label} (${id}) ===`);
    console.log('Headers:', JSON.stringify(r.data.values?.[0]));
    if (r.data.values?.[1]) console.log('Row 1:', JSON.stringify(r.data.values[1]));
  } catch(e) { console.log(`${label}: ERROR - ${e.message}`); }
}

async function main() {
  // ProjetoVD Survey sheets
  await readHeaders('1uucY0j9S1k-GCrJuKmwIH6_aVeyYtTdz0JwUtQszLmE', 'Survey Trafego');
  await readHeaders('1h5ar6lKb4B0dWFqNVtEFlwB5YjF7sqh8COgi-mQxyB0', 'Survey Organica');
  // ProjetoVD Leads sheets
  await readHeaders('1pWLDLVSq1GA9H3AqKiVJcR7kFPj8KePw_1f6egvvCrw', 'Leads Trafego');
}
main();
