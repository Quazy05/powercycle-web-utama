import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../lib/db';

export async function GET() {
  try {
    const pool = await getDbConnection();
    const [rows] = await pool.query('SELECT * FROM master_unit ORDER BY nama_unit ASC');
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch unit' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { nama_unit, map_url, image_url } = body;

    if (!nama_unit || !nama_unit.trim()) {
      return NextResponse.json({ success: false, error: 'Nama unit wajib diisi' }, { status: 400 });
    }

    const pool = await getDbConnection();
    const [result] = await pool.query(
      'INSERT INTO master_unit (nama_unit, map_url, image_url) VALUES (?, ?, ?)',
      [nama_unit.trim(), map_url || null, image_url || null]
    );

    return NextResponse.json({ success: true, id: result.insertId });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, nama_unit, map_url, image_url } = body;

    if (!id || !nama_unit || !nama_unit.trim()) {
      return NextResponse.json({ success: false, error: 'ID dan Nama Unit wajib diisi' }, { status: 400 });
    }

    const pool = await getDbConnection();
    await pool.query(
      'UPDATE master_unit SET nama_unit = ?, map_url = ?, image_url = ? WHERE id = ?',
      [nama_unit.trim(), map_url || null, image_url || null, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: 'ID wajib diisi' }, { status: 400 });

    const pool = await getDbConnection();
    await pool.query('DELETE FROM master_unit WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}