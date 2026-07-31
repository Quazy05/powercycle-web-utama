import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import { db } from '../../../lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    await query('DELETE FROM dokumentasi_kegiatan WHERE id = ?', [id]);

    try {
      await deleteDoc(doc(db, 'dokumentasi_kegiatan', id));
    } catch (err) {
      console.warn('Firebase document delete failed:', err);
    }

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    await query(
      'INSERT INTO activity_log (timestamp, user, action, detail, type) VALUES (?, ?, ?, ?, ?)',
      [timestamp, 'Admin', 'Hapus Dokumentasi', `Hapus dokumentasi ${id}`, 'delete']
    );

    return NextResponse.json({ success: true, message: 'Berhasil dihapus' });
  } catch (error) {
    console.error('API DELETE /dokumentasi Error:', error);
    return NextResponse.json({ error: 'Gagal menghapus data' }, { status: 500 });
  }
}
