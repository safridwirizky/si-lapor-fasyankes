const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const dir = './repo_files';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.xlsx')).sort();

files.forEach(file => {
  console.log('\n==================================================');
  console.log('FILE:', file);
  try {
    const workbook = XLSX.readFile(path.join(dir, file));
    console.log('Sheet Names Count:', workbook.SheetNames.length);
    console.log('Sheets:', workbook.SheetNames);
    
    // Pick the REKAP or first 2 sheets
    const sheetsToInspect = workbook.SheetNames.slice(0, 3);
    sheetsToInspect.forEach(sheetName => {
      console.log(`\n  >>> Sheet: ${sheetName}`);
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      console.log(`  Rows: ${json.length}`);
      // Find non-empty rows
      const nonEmpties = json.filter(r => r && r.some(cell => cell !== null && cell !== undefined && cell !== ''));
      console.log(`  Non-empty Rows: ${nonEmpties.length}`);
      nonEmpties.slice(0, 6).forEach((row, i) => {
        console.log(`    Row ${i+1}:`, row.slice(0, 10).map(c => c === undefined ? '' : c));
      });
    });
  } catch (err) {
    console.error('Error:', err.message);
  }
});
