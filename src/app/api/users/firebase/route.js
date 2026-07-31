import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

export const dynamic = 'force-dynamic';

function initFirebaseAdmin() {
  if (getApps().length === 0) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'banksampah-b370e';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    if (!clientEmail || !privateKey) return null;

    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }
  return getApps()[0];
}

export async function GET() {
  try {
    const adminApp = initFirebaseAdmin();
    if (!adminApp) {
      return NextResponse.json({ success: false, error: 'Firebase Admin SDK gagal inisialisasi.', data: [] }, { status: 500 });
    }

    const auth = getAuth(adminApp);
    const listUsersResult = await auth.listUsers(100);

    const formattedUsers = listUsersResult.users.map((u) => ({
      uid: u.uid,
      email: u.email || '-',
      name: u.displayName || u.email || '-',
      provider: u.providerData && u.providerData.length > 0 ? u.providerData[0].providerId : 'password',
      created_at: u.metadata.creationTime ? new Date(u.metadata.creationTime).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
      last_sign_in: u.metadata.lastSignInTime ? new Date(u.metadata.lastSignInTime).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
      status: u.disabled ? 'Non-Aktif' : 'Aktif'
    }));

    return NextResponse.json({ success: true, data: formattedUsers });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message, data: [] }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const adminApp = initFirebaseAdmin();
    if (!adminApp) {
      return NextResponse.json({ success: false, error: 'Firebase Admin SDK belum dikonfigurasi.' }, { status: 500 });
    }

    const body = await request.json();
    const { name, email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email dan password wajib diisi.' }, { status: 400 });
    }

    const auth = getAuth(adminApp);
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: name || email,
    });

    return NextResponse.json({
      success: true,
      message: 'User Firebase berhasil dibuat',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName
      }
    });
  } catch (error) {
    console.error('Error Create Firebase User:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}