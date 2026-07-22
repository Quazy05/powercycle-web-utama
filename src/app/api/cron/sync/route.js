import { NextResponse } from 'next/server';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db as firestore } from '../../../lib/firebase';
import { query, getDbConnection } from '../../../lib/db';

export async function GET() {
  try {
    const pool = await getDbConnection();
    let pushCount = 0;
    let pullCount = 0;

    // A. PUSH: MySQL temporary_deposits -> Firebase temporary_deposits
    const [tempDeposits] = await pool.query('SELECT * FROM temporary_deposits WHERE synced = 0 OR synced = FALSE');
    
    for (const record of tempDeposits) {
      const docRef = doc(firestore, 'temporary_deposits', record.id);
      
      await setDoc(docRef, {
        id: record.id,
        date: record.date || '',
        time: record.time || '',
        user: record.user || '',
        client: record.client || '',
        unit: record.unit || '',
        category: record.category || '',
        jenis: record.jenis || '',
        pengelola: record.pengelola || '',
        weight: record.weight || 0,
        status: record.status || '',
        remarks: record.remarks || '',
        alasan_penolakan: record.alasan_penolakan || ''
      });

      await pool.query('UPDATE temporary_deposits SET synced = 1, synced_at = NOW() WHERE id = ?', [record.id]);
      pushCount++;
    }

    // B. PULL: Firebase deposits collection -> MySQL deposits
    const querySnapshot = await getDocs(collection(firestore, 'deposits'));
    
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      const id = docSnap.id;

      // Skip jika sudah pernah di-sync ke MySQL
      if (data.synced_to_mysql === true) {
        continue;
      }
      
      const [existing] = await pool.query('SELECT id FROM deposits WHERE id = ?', [id]);
      
      if (existing.length === 0) {
        await pool.query(
          `INSERT INTO deposits (id, date, time, user, client, unit, category, jenis, pengelola, weight, status, remarks) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            data.id || id,
            data.date || '',
            data.time || '',
            data.user || '',
            data.client || '',
            data.unit || '',
            data.category || '',
            data.jenis || '',
            data.pengelola || '',
            data.weight || 0,
            data.status || 'Terverifikasi',
            data.remarks || ''
          ]
        );
        
        const month = (data.date || '').substring(0, 7);
        await pool.query(
          `INSERT INTO neraca_sampah (month, unit, category, jenis, timbulan, dimanfaatkan)
           VALUES (?, ?, ?, ?, ?, 0)
           ON DUPLICATE KEY UPDATE timbulan = timbulan + VALUES(timbulan)`,
          [
            month,
            data.unit || 'Pusat',
            data.category || '',
            data.jenis || '',
            data.weight || 0
          ]
        );
      }
      
      // Tandai synced_to_mysql = true di Firestore (JANGAN HAPUS DARI FIRESTORE)
      const docRef = doc(firestore, 'deposits', id);
      await setDoc(docRef, {
        synced_to_mysql: true,
        synced_at: new Date().toISOString()
      }, { merge: true });

      pullCount++;
    }

    // C. Record sync history
    const details = `Pushed ${pushCount} temporary deposits. Pulled ${pullCount} verified deposits.`;
    await pool.query(
      'INSERT INTO sync_log (sync_type, records_count, status, details) VALUES (?, ?, ?, ?)',
      ['CRON_SYNC', pushCount + pullCount, 'SUCCESS', details]
    );

    return NextResponse.json({ success: true, push_count: pushCount, pull_count: pullCount, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Cron sync error:', error);
    try {
      await query(
        'INSERT INTO sync_log (sync_type, records_count, status, details) VALUES (?, ?, ?, ?)',
        ['CRON_SYNC', 0, 'FAILED', error.message]
      );
    } catch (e) {}
    return NextResponse.json({ error: 'Sync failed', details: error.message }, { status: 500 });
  }
}
