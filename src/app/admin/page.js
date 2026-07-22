'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { AdminDashboard } from '../components/AdminDashboard';

export default function AdminPage() {
  const { role, unit, logout } = useAuth();
  const router = useRouter();
  
  const [deposits, setDeposits] = useState([]);
  const [neraca, setNeraca] = useState([]);
  const [buktiBayar, setBuktiBayar] = useState([]);
  const [inventarisasi, setInventarisasi] = useState([]);
  const [rekapProgram, setRekapProgram] = useState([]);
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Fungsi notifikasi kustom
  const triggerNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchData = useCallback(async () => {
    try {
      const queryUnit = (role === 'admin sis' || !unit) ? '' : `?unit=${unit}`;
      const [resDep, resTemp, resNer, resBuk, resInv, resRekap, resUsers, resClients] = await Promise.all([
        fetch('/api/deposits' + queryUnit),
        fetch('/api/temporary-deposits' + queryUnit),
        fetch('/api/neraca'),
        fetch('/api/bukti' + queryUnit),
        fetch('/api/inventarisasi'),
        fetch('/api/rekap-program'),
        fetch('/api/users'),
        fetch('/api/clients')
      ]);

      const [dataDep, dataTemp, dataNer, dataBuk, dataInv, dataRekap, dataUsers, dataClients] = await Promise.all([
        resDep.json(), resTemp.json(), resNer.json(), resBuk.json(), resInv.json(), resRekap.json(), resUsers.json(), resClients.json()
      ]);

      let allDeposits = [];
      if (dataDep.success) allDeposits = [...allDeposits, ...dataDep.deposits];
      if (dataTemp.success) allDeposits = [...allDeposits, ...dataTemp.deposits];
      
      // Deduplicate deposits by id to prevent duplicate React key console errors
      const uniqueMap = new Map();
      allDeposits.forEach(d => { if (d && d.id) uniqueMap.set(d.id, d); });
      allDeposits = Array.from(uniqueMap.values());

      allDeposits.sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));

      setDeposits(allDeposits);
      if (dataNer.success) setNeraca(dataNer.neraca);
      if (dataBuk.success) setBuktiBayar(dataBuk.buktiBayar);
      if (dataUsers.success) setUsers(dataUsers.users);
      if (dataClients.success) setClients(dataClients.clients);
      if (Array.isArray(dataInv)) setInventarisasi(dataInv);
      if (Array.isArray(dataRekap)) setRekapProgram(dataRekap);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, [role, unit]);

  useEffect(() => {
    if (role !== 'admin sis' && role !== 'admin llk') {
      router.push('/');
      return;
    }
    fetchData();
  }, [fetchData, role, router]);

  // Cron Job: Sinkronisasi data MySQL ↔ Firebase setiap 1 menit
  useEffect(() => {
    if (role !== 'admin sis' && role !== 'admin llk') return;
    
    const syncInterval = parseInt(process.env.NEXT_PUBLIC_SYNC_INTERVAL || '60000', 10);
    
    const runSync = async () => {
      try {
        const res = await fetch('/api/cron/sync');
        const data = await res.json();
        if (data.success) {
          const total = (data.push_count || 0) + (data.pull_count || 0);
          if (total > 0) {
            console.log(`[Cron Sync] Push: ${data.push_count}, Pull: ${data.pull_count}`);
            triggerNotification(`Sync berhasil: ${data.push_count} push, ${data.pull_count} pull`, 'success');
            await fetchData(); // Refresh data setelah sync
          }
        }
      } catch (err) {
        console.error('[Cron Sync] Error:', err);
      }
    };

    // Jalankan sync pertama kali setelah 5 detik
    const initialTimeout = setTimeout(runSync, 5000);
    // Lalu setiap interval (default 1 menit)
    const interval = setInterval(runSync, syncInterval);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [role, fetchData]);

  const handleLogout = () => { logout(); router.push('/'); };

  const handleUpdateBuktiStatus = async (id, status, remarks = '') => {
    try {
      const response = await fetch(`/api/bukti/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, remarks })
      });

      const data = await response.json();
      if (data.success) {
        triggerNotification("Status berhasil diperbarui!", "success");
        await fetchData(); 
      } else {
        triggerNotification("Gagal: " + data.error, "error");
      }
    } catch (err) {
      triggerNotification("Terjadi kesalahan sistem.", "error");
    }
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><h3>Loading dashboard...</h3></div>;

  return (
    <>
      {/* Notifikasi Kustom */}
      {notification && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999, padding: '16px 24px', borderRadius: 12,
          background: notification.type === 'success' ? '#10B981' : '#EF4444', color: 'white', fontWeight: 700,
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)', animation: 'fadeIn 0.3s ease-out'
        }}>
          {notification.message}
        </div>
      )}

      <AdminDashboard 
        role={role}
        deposits={deposits} 
        neraca={neraca}
        buktiBayar={buktiBayar}
        inventarisasi={inventarisasi}
        rekapProgram={rekapProgram}
        users={users}
        clients={clients}
        onLogout={handleLogout} 
        onUpdateBuktiStatus={handleUpdateBuktiStatus}
        userUnit={unit}
        onRefreshData={fetchData}
      />
      
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </>
  );
}