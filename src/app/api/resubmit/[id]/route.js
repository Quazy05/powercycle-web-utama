import { NextResponse } from 'next/server';
import { doc, setDoc } from 'firebase/firestore';
import { db as firestore } from '../../../lib/firebase';
import { getDbConnection } from '../../../lib/db';

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
    
    const finalDate = body.date || current.date;
    const finalTime = body.time || current.time;
    const finalCategory = body.category || current.category;
    const finalJenis = body.jenis || current.jenis;
    const finalPengelola = body.pengelola || current.pengelola;
    const finalWeight = body.weight || current.weight;

    await pool.query(
      `INSERT INTO temporary_deposits (id, date, time, user, client, unit, category, jenis, pengelola, weight, status, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Menunggu Validasi', 0)`,
      [
        id, 
        finalDate, 
        finalTime, 
        current.user, 
        current.client, 
        current.unit, 
        finalCategory, 
        finalJenis, 
        finalPengelola, 
        finalWeight
      ]
    );

    try {
      const docRef = doc(firestore, 'temporary_deposits', id);
      await setDoc(docRef, {
        id: id,
        date: finalDate,
        time: finalTime,
        user: current.user || '',
        client: current.client || '',
        unit: current.unit || '',
        category: finalCategory,
        jenis: finalJenis,
        pengelola: finalPengelola,
        weight: finalWeight,
        status: 'Menunggu Validasi',
        remarks: '',
        alasan_penolakan: ''
      });

      await pool.query('UPDATE temporary_deposits SET synced = 1, synced_at = NOW() WHERE id = ?', [id]);
    } catch (fbErr) {
      console.warn('Gagal instant sync ke Firebase saat resubmit, cron akan mencoba retry:', fbErr.message);
    }
    
    await pool.query('DELETE FROM deposits WHERE id = ?', [id]);
    
    return NextResponse.json({ success: true, message: 'Data berhasil dikirim ulang dan disinkronkan' });
  } catch (err) {
    console.error('Error during resubmit:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan saat kirim ulang', details: err.message }, { status: 500 });
  }
}