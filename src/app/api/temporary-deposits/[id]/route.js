import { NextResponse } from 'next/server';
import { query, getDbConnection } from '../../../lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const pool = await getDbConnection();
    const [rows] = await pool.query('SELECT * FROM temporary_deposits WHERE id = ?', [id]);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Data not found in temporary deposits' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch temporary deposit',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    await query('DELETE FROM temporary_deposits WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Deleted from temporary deposits'
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to delete temporary deposit',
        details: error.message
      },
      { status: 500 }
    );
  }
}