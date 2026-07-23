'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { UserDashboard } from '../components/UserDashboard';

export default function UserPage() {
  const { role, unit, username, logout } = useAuth();
  const router = useRouter();
  
  const [deposits, setDeposits] = useState([]);
  const [neraca, setNeraca] = useState([]);
  const [buktiBayar, setBuktiBayar] = useState([]);
  const [masterJenis, setMasterJenis] = useState([]);
  const [masterPengelola, setMasterPengelola] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== 'user') {
      router.push('/');
      return;
    }

    async function fetchData() {
      try {
        const [resDep, resTemp, resNer, resBuk, resJenis, resPengelola] = await Promise.all([
          fetch('/api/deposits?user=' + username),
          fetch('/api/temporary-deposits?user=' + username),
          fetch('/api/neraca'),
          fetch('/api/bukti' + (unit ? `?unit=${unit}` : '')),
          fetch('/api/master/jenis-sampah'),
          fetch('/api/master/pengelola')
        ]);

        const dataDep = await resDep.json();
        const dataTemp = await resTemp.json();
        const dataNer = await resNer.json();
        const dataBuk = await resBuk.json();
        const dataJenis = await resJenis.json();
        const dataPengelola = await resPengelola.json();

        let allDeposits = [];
        if (dataDep.success) allDeposits = [...allDeposits, ...dataDep.deposits];
        if (dataTemp.success) allDeposits = [...allDeposits, ...dataTemp.deposits];
        const uniqueMap = new Map();
        allDeposits.forEach(d => { if (d && d.id) uniqueMap.set(d.id, d); });
        allDeposits = Array.from(uniqueMap.values());
        allDeposits.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateB - dateA;
        });

        setDeposits(allDeposits);
        if (dataNer.success) setNeraca(dataNer.neraca);
        if (dataBuk.success) setBuktiBayar(dataBuk.buktiBayar);
        if (dataJenis.success) setMasterJenis(dataJenis.data);
        if (dataPengelola.success) setMasterPengelola(dataPengelola.data);
      } catch (err) {
        console.error('Failed to fetch user dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [role, username, unit, router]);
  useEffect(() => {
    if (role !== 'user') return;
    const syncInterval = parseInt(process.env.NEXT_PUBLIC_SYNC_INTERVAL || '60000', 10);
    const runSync = async () => {
      try {
        await fetch('/api/cron/sync');
      } catch (err) {
        console.error('[User Cron Sync] Error:', err);
      }
    };
    const interval = setInterval(runSync, syncInterval);
    return () => clearInterval(interval);
  }, [role]);

  if (role !== 'user') return null;
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--ds-bg)', color: 'var(--ds-text)', fontFamily: 'sans-serif' }}>
        <h3>Loading dashboard...</h3>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleAddDeposit = async (deposit) => {
    try {
      const res = await fetch('/api/temporary-deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deposit)
      });
      const data = await res.json();
      if (data.success) {
        const newDep = { ...deposit, id: data.id, status: 'Menunggu Validasi' };
        setDeposits(prev => {
          const filtered = prev.filter(d => d.id !== data.id);
          return [newDep, ...filtered];
        });
        return { success: true, id: data.id };
      } else {
        alert('Gagal menambah setoran: ' + data.error);
        return { success: false };
      }
    } catch (err) {
      console.error('Add deposit error:', err);
      return { success: false };
    }
  };

  const handleDeleteDeposit = async (id, status) => {
    try {
      const isTemporary = status === 'Menunggu Validasi' || status === 'Pending';
      const endpoint = isTemporary ? `/api/temporary-deposits/${id}` : `/api/deposits/${id}`;
      const res = await fetch(endpoint, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDeposits(prev => prev.filter(d => d.id !== id));
      } else {
        alert('Gagal menghapus data: ' + data.error);
      }
    } catch (err) {
      console.error('Delete deposit error:', err);
    }
  };

  const handleUpdateDeposit = async (id, updatedData) => {
    try {
      const res = await fetch(`/api/resubmit/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      const data = await res.json();
      if (data.success) {
        setDeposits(prev => prev.map(d => 
          d.id === id ? { ...d, ...updatedData, status: 'Menunggu Validasi', remarks: '' } : d
        ));
        return { success: true };
      } else {
        alert('Gagal mengirim ulang data: ' + data.error);
        return { success: false };
      }
    } catch (err) {
      console.error('Update deposit error:', err);
      return { success: false };
    }
  };

  const handleAddBuktiBayar = async (bukti) => {
    try {
      const res = await fetch('/api/bukti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bukti)
      });
      const data = await res.json();
      if (data.success) {
        setBuktiBayar(prev => [bukti, ...prev]);
      } else {
        alert('Gagal mengunggah bukti bayar: ' + data.error);
      }
    } catch (err) {
      console.error('Add bukti error:', err);
    }
  };

  const handleDeleteBukti = async (id) => {
  try {
    const res = await fetch(`/api/bukti/${id}`, { method: 'DELETE' });
    
    const text = await res.text();
    if (!res.ok) throw new Error("Server error: " + res.status);
    
    const data = JSON.parse(text);
    if (data.success) {
      setBuktiBayar(prev => prev.filter(b => b.id !== id));
    }
  } catch (err) {
    console.error("Error Detail:", err);
    alert("Gagal menghapus: " + err.message);
  }
};

  return (
  <UserDashboard 
    deposits={deposits} 
    neraca={neraca}
    buktiBayar={buktiBayar}
    masterJenis={masterJenis}
    masterPengelola={masterPengelola}
    onLogout={handleLogout} 
    onAddDeposit={handleAddDeposit}
    onDeleteDeposit={handleDeleteDeposit}
    onUpdateDeposit={handleUpdateDeposit}
    onAddBuktiBayar={handleAddBuktiBayar}
    onDeleteBuktiBayar={handleDeleteBukti} // <--- TAMBAHKAN INI
    userUnit={unit}
    username={username}
  />
);
}
