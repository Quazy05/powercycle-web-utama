import { NextResponse } from 'next/server';
import { getDbConnection } from '../../../lib/db';
import { db } from '../../../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query as fbQuery, orderBy } from 'firebase/firestore';

export async function GET() {
  try {
    const q = fbQuery(collection(db, 'master_unit'), orderBy('nama_unit', 'asc'));
    const snapshot = await getDocs(q);
    const rows = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch unit: ' + error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { nama_unit, map_url, image_url } = body;

    if (!nama_unit || !nama_unit.trim()) {
      return NextResponse.json({ success: false, error: 'Nama unit wajib diisi' }, { status: 400 });
    }

    const docRef = await addDoc(collection(db, 'master_unit'), {
      nama_unit: nama_unit.trim(),
      map_url: map_url || null,
      image_url: image_url || null
    });

    return NextResponse.json({ success: true, id: docRef.id });
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

    const docRef = doc(db, 'master_unit', id.toString());
    await updateDoc(docRef, {
      nama_unit: nama_unit.trim(),
      map_url: map_url || null,
      image_url: image_url || null
    });

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

    await deleteDoc(doc(db, 'master_unit', id.toString()));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}