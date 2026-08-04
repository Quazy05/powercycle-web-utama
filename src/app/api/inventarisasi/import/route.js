import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import * as XLSX from 'xlsx';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: 'File tidak ditemukan' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    const sheetName = 'Neraca Pengelolaan Sampah';
    if (!workbook.SheetNames.includes(sheetName)) {
      return NextResponse.json({ success: false, error: 'Sheet "Neraca Pengelolaan Sampah" tidak ditemukan dalam file.' }, { status: 400 });
    }

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    let yearRowIndex = -1;
    for (let i = 0; i < 10; i++) {
      if (rows[i] && rows[i][11] == 2022 && rows[i][12] == 2023) {
        yearRowIndex = i;
        break;
      }
    }

    if (yearRowIndex === -1) {
      return NextResponse.json({ success: false, error: 'Format tahun (2022, 2023...) tidak ditemukan di baris yang diharapkan pada kolom L.' }, { status: 400 });
    }

    const years = [
      rows[yearRowIndex][11]?.toString().replace(/\D/g, ''),
      rows[yearRowIndex][12]?.toString().replace(/\D/g, ''),
      rows[yearRowIndex][13]?.toString().replace(/\D/g, ''),
      rows[yearRowIndex][14]?.toString().replace(/\D/g, ''),
      rows[yearRowIndex][15]?.toString().replace(/\D/g, '')
    ];

    const dataToInsert = [];
    let currentLargeCategory = 'Sampah dari Proses Produksi'; 

    for (let i = yearRowIndex + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row) continue;

      if (typeof row[8] === 'string' && !row[9]) {
        currentLargeCategory = row[8];
        continue;
      }

      const no = row[8];
      const jenisLimbah = row[9];
      const kategori = row[10];

      if (no !== undefined && jenisLimbah && jenisLimbah.trim() !== '' && jenisLimbah !== 'Jenis Limbah' && jenisLimbah !== 'Kategori ') {
        for (let y = 0; y < 5; y++) {
          const tahun = years[y];
          if (!tahun) continue;

          const timbulan = parseFloat(row[11 + y]) || 0;
          const dimanfaatkan = parseFloat(row[16 + y]) || 0;
          const residu = parseFloat(row[21 + y]) || 0;

          if (timbulan === 0 && dimanfaatkan === 0 && residu === 0 && (kategori === '-' || !kategori)) continue;

          dataToInsert.push({
            tahun,
            category: kategori && kategori !== '-' ? kategori : currentLargeCategory,
            jenis: jenisLimbah,
            timbulan,
            dimanfaatkan,
            residu_tpa: residu
          });
        }
      }
    }

    if (dataToInsert.length === 0) {
      return NextResponse.json({ success: false, error: 'Tidak ada data valid yang ditemukan untuk di-import.' }, { status: 400 });
    }

    for (const item of dataToInsert) {
      const checkQuery = `SELECT id FROM neraca_sampah_tahunan WHERE tahun = ? AND category = ? AND jenis = ?`;
      const existing = await query(checkQuery, [item.tahun, item.category, item.jenis]);

      if (existing.length > 0) {
        const updateQuery = `UPDATE neraca_sampah_tahunan SET timbulan = ?, dimanfaatkan = ?, residu_tpa = ? WHERE id = ?`;
        await query(updateQuery, [item.timbulan, item.dimanfaatkan, item.residu_tpa, existing[0].id]);
      } else {
        const insertQuery = `INSERT INTO neraca_sampah_tahunan (tahun, category, jenis, timbulan, dimanfaatkan, residu_tpa) VALUES (?, ?, ?, ?, ?, ?)`;
        await query(insertQuery, [item.tahun, item.category, item.jenis, item.timbulan, item.dimanfaatkan, item.residu_tpa]);
      }
    }

    return NextResponse.json({ success: true, message: `Berhasil mengimpor ${dataToInsert.length} data historis.` });

  } catch (error) {
    console.error('Error importing Excel:', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan saat mengimpor Excel.' }, { status: 500 });
  }
}
