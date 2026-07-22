import { NextResponse } from 'next/server';
import { doc, setDoc } from 'firebase/firestore';
import { db as firestore } from '../../lib/firebase';
import { query, getDbConnection } from '../../lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const unit = searchParams.get('unit');
    const user = searchParams.get('user');

    let sql = 'SELECT * FROM temporary_deposits WHERE 1=1';
    const params = [];

    if (unit) {
      sql += ' AND unit = ?';
      params.push(unit);
    }
    if (user) {
      sql += ' AND user = ?';
      params.push(user);
    }

    sql += ' ORDER BY date DESC, time DESC';

    const pool = await getDbConnection();
    const [rows] = await pool.query(sql, params);

    return NextResponse.json({ success: true, deposits: rows });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch temporary deposits', details: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { id, date, time, user, client, unit, category, jenis, pengelola, weight, remarks } = data;

    const depositId = id || 'TD' + Date.now();
    const depositStatus = 'Menunggu Validasi';
    let isSynced = 0;

    // 1. Simpan ke MySQL lokal terlebih dahulu
    await query(
      `INSERT INTO temporary_deposits (id, date, time, user, client, unit, category, jenis, pengelola, weight, status, remarks, synced) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        depositId, 
        date || '', 
        time || '', 
        user || '', 
        client || '', 
        unit || '', 
        category || '', 
        jenis || '', 
        pengelola || '', 
        weight || 0, 
        depositStatus, 
        remarks || ''
      ]
    );

    // 2. Langsung kirim ke Firebase Firestore secara instan (agar QR Code bisa langsung di-scan)
    try {
      const docRef = doc(firestore, 'temporary_deposits', depositId);
      await setDoc(docRef, {
        id: depositId,
        date: date || '',
        time: time || '',
        user: user || '',
        client: client || '',
        unit: unit || '',
        category: category || '',
        jenis: jenis || '',
        pengelola: pengelola || '',
        weight: weight || 0,
        status: depositStatus,
        remarks: remarks || '',
        alasan_penolakan: ''
      });

      // Update status synced di MySQL jika berhasil terkirim ke Firebase
      await query('UPDATE temporary_deposits SET synced = 1, synced_at = NOW() WHERE id = ?', [depositId]);
      isSynced = 1;
      console.log(`[Instant Sync] Successfully pushed ${depositId} to Firebase.`);
    } catch (fbError) {
      console.warn(`[Instant Sync Warning] Failed to push ${depositId} directly to Firebase. Cron job will retry.`, fbError.message);
    }

    // 3. Catat log aktivitas ke MySQL
    const timestamp = time.length === 5 ? `${date} ${time}:00` : `${date} ${time}`;
    const detailLog = `${category} (${jenis}) ${weight} kg - ${pengelola} (Menunggu Validasi)`;
    await query(
      'INSERT INTO activity_log (timestamp, user, action, detail, type) VALUES (?, ?, ?, ?, ?)',
      [timestamp, user, 'Input Data Sementara', detailLog, 'input']
    );

    return NextResponse.json({ success: true, id: depositId, synced: isSynced });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save temporary deposit', details: error.message }, { status: 500 });
  }
}

