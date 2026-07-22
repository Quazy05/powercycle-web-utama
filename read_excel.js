const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(process.cwd(), 'keperluan', '26 PS Rekapitulasi Program Pengelolaan Sampah PLTA Wonogiri.xlsx');
const workbook = XLSX.readFile(filePath);

console.log("Sheets:", workbook.SheetNames);

for (const sheetName of workbook.SheetNames) {
    console.log(`\n--- Sheet: ${sheetName} ---`);
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log(data.slice(0, 10)); // print first 10 rows
}
