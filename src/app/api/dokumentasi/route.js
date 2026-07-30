import { NextResponse } from 'next/server';
import { query } from '../../lib/db';
import { db } from '../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const unit = searchParams.get('unit');

    let sql = 'SELECT * FROM dokumentasi_kegiatan';
    const params = [];

    if (unit && unit !== 'Pusat') {
      sql += ' WHERE unit = ?';
      params.push(unit);
    }

    sql += ' ORDER BY created_at DESC';

    const results = await query(sql, params);
    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('API GET /dokumentasi Error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { kegiatan, unit, img_url } = data;

    if (!kegiatan || !unit || !img_url) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // Save to Firebase directly
    const docRef = await addDoc(collection(db, 'dokumentasi_kegiatan'), {
      kegiatan,
      unit,
      user: 'User',
      img_url,
      location: null,
      address: 'Uploaded via Website Utama',
      created_at: new Date().toISOString(),
      synced_to_mysql: false
    });

    // Logging action in MySQL
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    await query(
      'INSERT INTO activity_log (timestamp, user, action, detail, type) VALUES (?, ?, ?, ?, ?)',
      [timestamp, 'User', 'Upload Dokumentasi', `Upload dokumentasi kegiatan ${kegiatan} untuk unit ${unit}`, 'upload']
    );

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('API POST /dokumentasi Error:', error);
    return NextResponse.json({ error: 'Gagal mengupload dokumentasi' }, { status: 500 });
  }
}
