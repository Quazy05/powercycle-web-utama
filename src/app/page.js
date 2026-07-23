import LandingPage from './components/LandingPage';
import { getDbConnection } from './lib/db';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let initialDeposits = [];
  let mockUsers = [];
  let pemanfaatanData = [];
  
  try {
    const pool = await getDbConnection();
    const [deposits] = await pool.query('SELECT * FROM deposits WHERE status = "Terverifikasi"');
    initialDeposits = deposits.map(d => ({ ...d, weight: Number(d.weight) }));
    
    const [users] = await pool.query('SELECT * FROM users');
    mockUsers = users;
    
    const [pemanfaatan] = await pool.query('SELECT * FROM input_program');
    pemanfaatanData = pemanfaatan.map(p => ({
      ...p,
      form_data: typeof p.form_data === 'string' ? JSON.parse(p.form_data) : p.form_data
    }));
  } catch (err) {
    console.error('Error fetching data for landing page:', err);
  }

  return <LandingPage initialDeposits={initialDeposits} mockUsers={mockUsers} pemanfaatanData={pemanfaatanData} />;
}
