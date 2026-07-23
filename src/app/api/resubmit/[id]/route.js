import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../../lib/db';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const pool = await getDbConnection();
    
    const [deposits] = await pool.query("SELECT * FROM deposits WHERE id = ? AND status = 'Ditolak'", [id]);
    if (deposits.length === 0) {
      return NextResponse.json({ error: 'Data tidak ditemukan atau status bukan Ditolak' }, { status: 404 });
    }
    
    const current = deposits[0];
    
    await pool.query(
      `INSERT INTO temporary_deposits (id, date, time, user, client, unit, category, jenis, pengelola, weight, status, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Menunggu Validasi', 0)`,
      [
        id, 
        body.date || current.date, 
        body.time || current.time, 
        current.user, 
        current.client, 
        current.unit, 
        body.category || current.category, 
        body.jenis || current.jenis, 
        body.pengelola || current.pengelola, 
        body.weight || current.weight
      ]
    );
    
    await pool.query('DELETE FROM deposits WHERE id = ?', [id]);
    
    return NextResponse.json({ success: true, message: 'Data berhasil dikirim ulang' });
  } catch (err) {
    console.error('Error during resubmit:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan saat kirim ulang', details: err.message }, { status: 500 });
  }
}
