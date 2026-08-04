import { NextResponse } from 'next/server';
import { getDbConnection } from '../../lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tahun = searchParams.get('tahun');
    
    const pool = await getDbConnection();

    let query = 'SELECT * FROM neraca_sampah_tahunan';
    let params = [];

    if (tahun) {
      query += ' WHERE tahun = ?';
      params.push(tahun);
    }
    
    query += ' ORDER BY tahun DESC, category ASC';

    const [rows] = await pool.query(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch inventarisasi data' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { tahun, category, jenis, timbulan, dimanfaatkan, residu_tpa } = body;

    if (!tahun || !category || !jenis) {
      return NextResponse.json({ error: 'Tahun, kategori, dan jenis sampah wajib diisi' }, { status: 400 });
    }

    const pool = await getDbConnection();

    const residuValue = residu_tpa !== undefined ? residu_tpa : (Number(timbulan || 0) - Number(dimanfaatkan || 0));

    await pool.query(
      'INSERT INTO neraca_sampah_tahunan (tahun, category, jenis, timbulan, dimanfaatkan, residu_tpa) VALUES (?, ?, ?, ?, ?, ?)',
      [tahun, category, jenis, Number(timbulan || 0), Number(dimanfaatkan || 0), residuValue > 0 ? residuValue : 0]
    );

    return NextResponse.json({ success: true, message: 'Data inventarisasi berhasil ditambahkan' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Gagal menambahkan data inventarisasi', details: error.message }, { status: 500 });
  }
}
