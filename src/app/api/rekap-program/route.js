import { NextResponse } from 'next/server';
import { getDbConnection } from '../../lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tahun = searchParams.get('tahun');
    
    const pool = await getDbConnection();

    let query = 'SELECT * FROM rekapitulasi_program';
    let params = [];

    if (tahun) {
      query += ' WHERE tahun = ?';
      params.push(tahun);
    }

    query += ' ORDER BY tahun DESC, id ASC';

    const [rows] = await pool.query(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch rekap program data' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { tahun, nama_program, jenis_sampah, jenis_kegiatan, absolut_ton } = body;

    if (!tahun || !nama_program || !jenis_sampah) {
      return NextResponse.json({ error: 'Tahun, nama program, dan jenis sampah wajib diisi' }, { status: 400 });
    }

    const pool = await getDbConnection();

    await pool.query(
      'INSERT INTO rekapitulasi_program (tahun, nama_program, jenis_sampah, jenis_kegiatan, absolut_ton) VALUES (?, ?, ?, ?, ?)',
      [tahun, nama_program, jenis_sampah, jenis_kegiatan || 'Pemanfaatan', Number(absolut_ton || 0)]
    );

    return NextResponse.json({ success: true, message: 'Data rekap program berhasil ditambahkan' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Gagal menambahkan data rekap program', details: error.message }, { status: 500 });
  }
}
