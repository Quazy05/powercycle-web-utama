import { NextResponse } from 'next/server';
import { getDbConnection } from '@/app/lib/db'; // sesuaikan path lib/db

export const dynamic = 'force-dynamic';

// GET: Ambil Semua User MySQL
export async function GET() {
  try {
    const pool = await getDbConnection();
    const [users] = await pool.query('SELECT id, name, email, role, unit, joinDate, status FROM users ORDER BY id ASC');
    
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Tambah User Baru ke MySQL
export async function POST(request) {
  try {
    const pool = await getDbConnection();
    const body = await request.json();
    const { name, email, password, role, unit, status } = body;

    // Generate ID User kustom (misal: U007, U008, dst)
    const [rows] = await pool.query('SELECT id FROM users ORDER BY id DESC LIMIT 1');
    let nextId = 'U001';
    if (rows.length > 0 && rows[0].id.startsWith('U')) {
      const lastNum = parseInt(rows[0].id.replace('U', ''), 10);
      if (!isNaN(lastNum)) {
        nextId = `U${String(lastNum + 1).padStart(3, '0')}`;
      }
    }

    const joinDate = new Date().toISOString().split('T')[0];

    await pool.query(
      'INSERT INTO users (id, name, email, password, role, unit, joinDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nextId, name, email, password || '123456', role || 'User', unit || 'Wonogiri', joinDate, status || 'Aktif']
    );

    return NextResponse.json({
      success: true,
      message: 'User MySQL berhasil ditambahkan',
      id: nextId
    });
  } catch (error) {
    console.error('Error Create MySQL User:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}