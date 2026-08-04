import { NextResponse } from 'next/server';
import { getDbConnection } from '../../lib/db';

export async function POST(request) {
  let pool;
  try {
    const { tahun, type } = await request.json();
    
    if (!tahun || !type) {
      return NextResponse.json({ error: 'Tahun dan tipe (inventarisasi/rekap) harus diisi' }, { status: 400 });
    }

    pool = await getDbConnection();

    if (type === 'inventarisasi') {
      const [rows] = await pool.query('SELECT category, jenis, SUM(timbulan) as total_timbulan, SUM(dimanfaatkan) as total_dimanfaatkan FROM neraca_sampah WHERE month LIKE ? GROUP BY category, jenis', [`${tahun}-%`]);
      
      if (rows.length === 0) {
        return NextResponse.json({ error: `Tidak ada data neraca sampah untuk tahun ${tahun}` }, { status: 404 });
      }

      let addedCount = 0;
      let updatedCount = 0;

      for (const row of rows) {
        const timbulanTon = Number(row.total_timbulan) / 1000;
        const dimanfaatkanTon = Number(row.total_dimanfaatkan) / 1000;
        const residuTpaTon = timbulanTon - dimanfaatkanTon;

        const [existing] = await pool.query(
          'SELECT id FROM neraca_sampah_tahunan WHERE tahun = ? AND category = ? AND jenis = ?',
          [tahun, row.category, row.jenis]
        );

        if (existing.length > 0) {
          await pool.query(
            'UPDATE neraca_sampah_tahunan SET timbulan = ?, dimanfaatkan = ?, residu_tpa = ? WHERE tahun = ? AND category = ? AND jenis = ?',
            [timbulanTon, dimanfaatkanTon, residuTpaTon > 0 ? residuTpaTon : 0, tahun, row.category, row.jenis]
          );
          updatedCount++;
        } else {
          await pool.query(
            'INSERT INTO neraca_sampah_tahunan (tahun, category, jenis, timbulan, dimanfaatkan, residu_tpa) VALUES (?, ?, ?, ?, ?, ?)',
            [tahun, row.category, row.jenis, timbulanTon, dimanfaatkanTon, residuTpaTon > 0 ? residuTpaTon : 0]
          );
          addedCount++;
        }
      }

      return NextResponse.json({ success: true, message: `Rekap selesai: ${addedCount} data baru ditambahkan, ${updatedCount} data diperbarui. Data historis lama tetap tersimpan.` });

    } else if (type === 'rekap') {
      const [rows] = await pool.query('SELECT program_name, kategori_sampah, jenis_sampah, form_data FROM input_program WHERE date LIKE ?', [`${tahun}-%`]);
      
      if (rows.length === 0) {
        return NextResponse.json({ error: `Tidak ada data pemanfaatan program untuk tahun ${tahun}` }, { status: 404 });
      }

      const rekapMap = {};

      for (const row of rows) {
        const key = `${row.program_name}|${row.jenis_sampah}`;
        
        let weight = 0;
        try {
          let formData = row.form_data;
          if (typeof formData === 'string') {
            formData = JSON.parse(formData);
          }
          
          if (formData) {
            const numericValues = Object.values(formData).map(v => Number(v)).filter(v => !isNaN(v) && v > 0);
            if (numericValues.length > 0) {
              weight = numericValues[0];
            }
          }
        } catch (e) {
          console.warn('Gagal parse form_data:', e);
        }

        if (!rekapMap[key]) {
          rekapMap[key] = {
            program_name: row.program_name,
            jenis_sampah: row.jenis_sampah || row.kategori_sampah || '-',
            totalKg: 0
          };
        }
        
        rekapMap[key].totalKg += weight;
      }

      let addedCount = 0;
      let updatedCount = 0;

      for (const key in rekapMap) {
        const item = rekapMap[key];
        const ton = item.totalKg / 1000;

        const [existing] = await pool.query(
          'SELECT id FROM rekapitulasi_program WHERE tahun = ? AND nama_program = ? AND jenis_sampah = ?',
          [tahun, item.program_name, item.jenis_sampah]
        );

        if (existing.length > 0) {
          await pool.query(
            'UPDATE rekapitulasi_program SET absolut_ton = ? WHERE tahun = ? AND nama_program = ? AND jenis_sampah = ?',
            [ton, tahun, item.program_name, item.jenis_sampah]
          );
          updatedCount++;
        } else {
          await pool.query(
            'INSERT INTO rekapitulasi_program (tahun, nama_program, jenis_sampah, jenis_kegiatan, absolut_ton) VALUES (?, ?, ?, ?, ?)',
            [tahun, item.program_name, item.jenis_sampah, 'Pemanfaatan', ton]
          );
          addedCount++;
        }
      }

      return NextResponse.json({ success: true, message: `Rekap selesai: ${addedCount} data baru ditambahkan, ${updatedCount} data diperbarui. Data historis lama tetap tersimpan.` });
    }

    return NextResponse.json({ error: 'Tipe tidak valid' }, { status: 400 });

  } catch (error) {
    console.error('Archive API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat merekap data', details: error.message }, { status: 500 });
  }
}
