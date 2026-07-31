import { NextResponse } from 'next/server';
import { getDbConnection } from '../../lib/db';

export async function GET(request) {
  try {
    const pool = await getDbConnection();
    const [users] = await pool.query('SELECT id, name, email, role, unit, joinDate, status FROM users ORDER BY name ASC');
    
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch users', details: error.message }, { status: 500 });
  }
}