import { useState, useMemo, useEffect } from 'react';
import {
  LayoutDashboard, Trash2, Users, Building2, FileText,
  BarChart2, Activity, Settings, LogOut, Menu,
  Search, Package, Scale, ChevronLeft, ChevronRight,
  Database, FileCheck, CheckCircle, Leaf, Recycle, Eye, Upload, Download, Maximize2, X
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from 'recharts';
import {
  formatWeight, formatWeightTon, TODAY,
  KATEGORI_SAMPAH
} from '../lib/mockData';
import { MasterDataManagement } from './MasterDataManagement';
import { ManajemenProgram } from './ManajemenProgram';
import { DataPemanfaatan } from './DataPemanfaatan';
import { exportToPDF, exportToExcelMultiSheet } from '../lib/exportUtils';


const DAFTAR_BULAN = [
  { id: '01', nama: 'Januari' },
  { id: '02', nama: 'Februari' },
  { id: '03', nama: 'Maret' },
  { id: '04', nama: 'April' },
  { id: '05', nama: 'Mei' },
  { id: '06', nama: 'Juni' },
  { id: '07', nama: 'Juli' },
  { id: '08', nama: 'Agustus' },
  { id: '09', nama: 'September' },
  { id: '10', nama: 'Oktober' },
  { id: '11', nama: 'November' },
  { id: '12', nama: 'Desember' }
];

const PLNLogo = ({ size = 36, unit = '' }) => {
  let customLogoUrl = '/Logo.png';
  if (unit === 'Wonogiri') customLogoUrl = '/Logo PLTA WONOGIRI.png';
  else if (unit === 'Banjarnegara') customLogoUrl = '/Logo PLTA PB. Soedirman.png';
  
  if (customLogoUrl) {
    return <img src={customLogoUrl} alt="Logo" style={{ height: size, maxWidth: '100%', objectFit: 'contain' }} />;
  }
  return null;
};

function filterDataBerdasarkanWaktu(dataList, rentangWaktu) {
  const tanggalHariIni = new Date(TODAY);
  
  return dataList.filter(item => {
    if (!item.date) return false;
    const tanggalItem = new Date(item.date);
    
    if (rentangWaktu === 'hari') {
      return item.date === TODAY;
    }
    if (rentangWaktu === 'minggu') {
      const selisihWaktu = tanggalHariIni.getTime() - tanggalItem.getTime();
      const selisihHari = selisihWaktu / (1000 * 3600 * 24);
      return selisihHari >= 0 && selisihHari <= 7;
    }
    if (rentangWaktu === 'bulan') {
      return tanggalItem.getMonth() === tanggalHariIni.getMonth() && 
             tanggalItem.getFullYear() === tanggalHariIni.getFullYear();
    }
    return true; 
  });
}

function StatusBadge({ status }) {
  const cfg = {
    'Terverifikasi': { bg: 'rgba(16, 185, 129, 0.08)', color: '#047857', border: '1px solid rgba(16, 185, 129, 0.2)' },
    'Pending': { bg: 'rgba(245, 158, 11, 0.08)', color: '#b45309', border: '1px solid rgba(245, 158, 11, 0.2)' },
    'Menunggu Validasi': { bg: 'rgba(59, 130, 246, 0.08)', color: '#2563EB', border: '1px solid rgba(59, 130, 246, 0.2)' },
    'Ditolak': { bg: 'rgba(239, 68, 68, 0.08)', color: '#b91c1c', border: '1px solid rgba(239, 68, 68, 0.2)' },
    'Aktif': { bg: 'rgba(16, 185, 129, 0.08)', color: '#047857', border: '1px solid rgba(16, 185, 129, 0.2)' },
    'Non-Aktif': { bg: 'rgba(100, 116, 139, 0.08)', color: '#475569', border: '1px solid rgba(100, 116, 139, 0.2)' },
    'Lunas': { bg: 'rgba(16, 185, 129, 0.08)', color: '#047857', border: '1px solid rgba(16, 185, 129, 0.2)' },
    'Menunggu Konfirmasi Admin': { bg: 'rgba(99, 102, 241, 0.08)', color: '#4338CA', border: '1px solid rgba(99, 102, 241, 0.2)' },
    'Disetujui': { bg: 'rgba(16, 185, 129, 0.08)', color: '#047857', border: '1px solid rgba(16, 185, 129, 0.2)' },
  };
  const { bg, color, border } = cfg[status] || { bg: 'rgba(100, 116, 139, 0.08)', color: '#475569', border: '1px solid rgba(100, 116, 139, 0.2)' };
  return (
    <span style={{ 
      background: bg, 
      color, 
      border,
      padding: '4px 10px', 
      borderRadius: '9999px', 
      fontSize: '0.72rem', 
      fontWeight: 700, 
      whiteSpace: 'nowrap', 
      display: 'inline-block' 
    }}>
      {status}
    </span>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }) {
  return (
    <div style={{ 
      background: 'white', 
      borderRadius: 20, 
      padding: '20px', 
      boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', 
      border: '1px solid var(--ds-border)' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ 
          backgroundColor: bg, 
          borderRadius: 14, 
          width: 48, 
          height: 48, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          flexShrink: 0 
        }}>
          <Icon size={22} style={{ color }} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--ds-text-muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>
          <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ds-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{value}</p>
        </div>
      </div>
    </div>
  );
}

const ITEMS_PER_PAGE = 10;

export function AdminDashboard({ role, deposits, neraca, buktiBayar, inventarisasi = [], rekapProgram = [], users = [], clients = [], onLogout, onDeleteDeposit, onUpdateStatus, onUpdateBuktiStatus, userUnit }) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [tablePage, setTablePage] = useState(1);
  const [selectedBulan, setSelectedBulan] = useState('2026-07');
  const [selectedTahunHistoris, setSelectedTahunHistoris] = useState('2025');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const [laporanFilter, setLaporanFilter] = useState('semua');
  const [activeKwitansiPopup, setActiveKwitansiPopup] = useState(null);
  const [selectedTahunBukti, setSelectedTahunBukti] = useState('2026');
  
  const [selectedRow, setSelectedRow] = useState(null);

  const [fullImage, setFullImage] = useState(null);
  
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notification, setNotification] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null); 
  const [rejectTarget, setRejectTarget] = useState(null); 
  const [rejectReason, setRejectReason] = useState(''); 

  const [programsData, setProgramsData] = useState([]);
  const [inputProgramsData, setInputProgramsData] = useState([]);

  useEffect(() => {
    if (role === 'admin llk' || role === 'admin sis' || !role) { // Fetch for all admins just in case, but particularly for llk
      fetch('/api/programs').then(res => res.json()).then(data => {
        if (data.success) setProgramsData(data.data);
      }).catch(console.error);
      fetch('/api/input-program').then(res => res.json()).then(data => {
        if (data.success) setInputProgramsData(data.data);
      }).catch(console.error);
    }
  }, [role]);

  useEffect(() => {
    setSelectedRow(null);
  }, [currentPage, tablePage, dateFilter, categoryFilter, searchQuery, selectedBulan, selectedTahunHistoris]);

  const [editingItem, setEditingItem] = useState(null);
  const [editFormType, setEditFormType] = useState('');
  const [editFormData, setEditFormData] = useState({});

  const handleEdit = (item, type) => {
    setEditingItem(item.id);
    setEditFormType(type);
    setEditFormData(item);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      let endpoint = '';
      if (editFormType === 'deposit') endpoint = `/api/deposits/${editingItem}`;
      if (editFormType === 'client') endpoint = `/api/clients/${editingItem}`;
      if (editFormType === 'neraca') endpoint = `/api/neraca/${editingItem}`;
      if (editFormType === 'inventarisasi') endpoint = `/api/inventarisasi/${editingItem}`;
      if (editFormType === 'rekap') endpoint = `/api/rekap-program/${editingItem}`;

      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      
      if (res.ok) {
        alert('Data berhasil diperbarui. Halaman akan dimuat ulang.');
        window.location.reload();
      } else {
        alert('Gagal memperbarui data.');
      }
    } catch (err) {
      alert('Terjadi kesalahan.');
    }
  };

  const handleDelete = async (id, type) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    try {
      let endpoint = '';
      if (type === 'deposit') endpoint = `/api/deposits/${id}`;
      if (type === 'client') endpoint = `/api/clients/${id}`;
      if (type === 'neraca') endpoint = `/api/neraca/${id}`;
      if (type === 'inventarisasi') endpoint = `/api/inventarisasi/${id}`;
      if (type === 'rekap') endpoint = `/api/rekap-program/${id}`;

      const res = await fetch(endpoint, { method: 'DELETE' });
      if (res.ok) {
        alert('Data berhasil dihapus. Halaman akan dimuat ulang.');
        window.location.reload();
      } else {
        alert('Gagal menghapus data.');
      }
    } catch (err) {
      alert('Terjadi kesalahan.');
    }
  };

  const unitDeposits = useMemo(() => deposits.filter(d => !userUnit || d.unit === userUnit), [deposits, userUnit]);
  const unitBuktiBayar = useMemo(() => buktiBayar.filter(b => !userUnit || b.unit === userUnit), [buktiBayar, userUnit]);

  const todayDeposits = useMemo(() => unitDeposits.filter(d => d.date === TODAY), [unitDeposits]);
  const totalWeight = useMemo(() => unitDeposits.reduce((s, d) => s + (Number(d.weight) || 0), 0), [unitDeposits]);
  const organikWeight = useMemo(() => unitDeposits.filter(d => d.category === 'Organik').reduce((s, d) => s + (Number(d.weight) || 0), 0), [unitDeposits]);
  const anorganikWeight = useMemo(() => unitDeposits.filter(d => d.category === 'Anorganik').reduce((s, d) => s + (Number(d.weight) || 0), 0), [unitDeposits]);
  const residuWeight = useMemo(() => unitDeposits.filter(d => d.category === 'Residu').reduce((s, d) => s + (Number(d.weight) || 0), 0), [unitDeposits]);

  const dailyChartData = useMemo(() => {
    const dataGrafik = [];
    const basisTanggal = new Date(TODAY);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(basisTanggal);
      d.setDate(basisTanggal.getDate() - i);
      
      const stringKeyTanggal = d.toISOString().split('T')[0];
      const labelFormatIndo = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });

      const transaksiHariIni = unitDeposits.filter(dep => dep.date === stringKeyTanggal);
      const beratOrganik = transaksiHariIni.filter(dep => dep.category === 'Organik').reduce((s, dep) => s + (Number(dep.weight) || 0), 0);
      const beratAnorganik = transaksiHariIni.filter(dep => dep.category === 'Anorganik').reduce((s, dep) => s + (Number(dep.weight) || 0), 0);
      const beratResidu = transaksiHariIni.filter(dep => dep.category === 'Residu').reduce((s, dep) => s + (Number(dep.weight) || 0), 0);

      dataGrafik.push({
        date: labelFormatIndo,
        Organik: Number(beratOrganik.toFixed(1)),
        Anorganik: Number(beratAnorganik.toFixed(1)),
        Residu: Number(beratResidu.toFixed(1))
      });
    }
    return dataGrafik;
  }, [unitDeposits]);

  const pieData = [
    { name: 'Organik', value: +Number(organikWeight).toFixed(1), color: '#10B981' },
    { name: 'Anorganik', value: +Number(anorganikWeight).toFixed(1), color: '#0891B2' },
    { name: 'Residu', value: +Number(residuWeight).toFixed(1), color: '#F59E0B' },
  ];

  const filteredDeposits = useMemo(() => {
    return unitDeposits.filter(d => {
      const q = searchQuery.toLowerCase();
      if (q && !d.pengelola.toLowerCase().includes(q)) return false;
      if (dateFilter && d.date !== dateFilter) return false;
      if (categoryFilter && d.category !== categoryFilter) return false;
      return true;
    });
  }, [unitDeposits, searchQuery, dateFilter, categoryFilter]);

  const totalTablePages = useMemo(() => {
    return Math.ceil(filteredDeposits.length / ITEMS_PER_PAGE);
  }, [filteredDeposits]);

  const paginatedDeposits = useMemo(() => {
    return filteredDeposits.slice((tablePage - 1) * ITEMS_PER_PAGE, tablePage * ITEMS_PER_PAGE);
  }, [filteredDeposits, tablePage]);

  const sidebarItems = role === 'admin sis' ? [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'manajemen-program', label: 'Manajemen Program', icon: FileText },
    { id: 'pengelola-data', label: 'Manajemen Pengguna & Unit', icon: Users },
    { id: 'master-data', label: 'Data Master', icon: Settings },
  ] : [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'waste-monitoring', label: 'Monitoring Sampah', icon: Trash2 },
    { id: 'reports', label: 'Laporan', icon: FileText },
    { id: 'neraca', label: 'Neraca Sampah Bulanan', icon: Database },
    { id: 'inventarisasi', label: 'Inventarisasi Historis', icon: FileCheck },
    { id: 'data-pemanfaatan', label: 'Data Pemanfaatan', icon: Activity },
    { id: 'rekap-program', label: 'Rekap Program Historis', icon: CheckCircle },
    { id: 'bukti-bayar', label: 'Bukti Bayar', icon: Recycle },
  ];

  const pageTitles = {
    dashboard: 'Dashboard', 'waste-monitoring': 'Monitoring Sampah',
    'pengelola-data': 'Manajemen Pengguna & Unit',
    'master-data': 'Manajemen Data Master',
    'manajemen-program': 'Manajemen Program Pemanfaatan',
    'data-pemanfaatan': 'Data Input Pemanfaatan (User)',
    reports: 'Laporan', neraca: 'Neraca Sampah Bulanan',
    'bukti-bayar': 'Bukti Bayar',
    inventarisasi: 'Inventarisasi Sampah Historis (2021-2026)',
    'rekap-program': 'Rekapitulasi Program Pengelolaan Sampah',
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
    setSidebarOpen(false);
    setTablePage(1);
  };

  const Pagination = ({ page, total, onChange, totalItems }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, flexWrap: 'wrap', gap: 12 }}>
      <span style={{ fontSize: '0.85rem', color: 'var(--ds-text-muted)', fontWeight: 500 }}>
        Halaman {page} dari {total || 1} ({totalItems} data)
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}
          style={{ padding: '8px 12px', border: '1px solid var(--ds-border)', borderRadius: 10, background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.45 : 1, display: 'flex', alignItems: 'center', color: 'var(--ds-text)' }}>
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: Math.min(total, 5) }, (_, i) => {
          const p = total <= 5 ? i + 1 : Math.max(1, Math.min(total - 4, page - 2)) + i;
          return (
            <button key={p} onClick={() => onChange(p)}
              style={{ padding: '8px 14px', border: `1.5px solid ${p === page ? 'var(--ds-accent)' : 'var(--ds-border)'}`, borderRadius: 10, background: p === page ? 'var(--ds-accent)' : 'white', color: p === page ? 'white' : 'var(--ds-text)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: p === page ? 700 : 500, transition: 'all 0.2s' }}>
              {p}
            </button>
          );
        })}
        <button onClick={() => onChange(Math.min(total, page + 1))} disabled={page === total || total === 0}
          style={{ padding: '8px 12px', border: '1px solid var(--ds-border)', borderRadius: 10, background: 'white', cursor: page === total || total === 0 ? 'not-allowed' : 'pointer', opacity: page === total || total === 0 ? 0.45 : 1, display: 'flex', alignItems: 'center', color: 'var(--ds-text)' }}>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <StatCard title="Total Unit PLN" value={clients.length} icon={Building2} color="#0891B2" bg="rgba(8, 145, 178, 0.08)" />
        <StatCard title="Input Hari Ini" value={todayDeposits.length} icon={Package} color="#10B981" bg="rgba(16, 185, 129, 0.08)" />
        <StatCard title="Total Berat" value={formatWeight(totalWeight)} icon={Scale} color="#6366F1" bg="rgba(99, 102, 241, 0.08)" />
      </div>

      {role !== 'admin sis' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <StatCard title="Sampah Organik" value={formatWeight(organikWeight)} icon={Database} color="#10B981" bg="rgba(16, 185, 129, 0.05)" />
            <StatCard title="Sampah Anorganik" value={formatWeight(anorganikWeight)} icon={Database} color="var(--ds-accent)" bg="rgba(8, 145, 178, 0.05)" />
            <StatCard title="Sampah Residu" value={formatWeight(residuWeight)} icon={Database} color="#F59E0B" bg="rgba(245, 158, 11, 0.05)" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', lg: '2fr 1fr', gap: 24 }}>
            <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)', marginBottom: 24, letterSpacing: '-0.3px' }}>Setoran Harian – 7 Hari Terakhir</h3>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--ds-text-muted)' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--ds-text-muted)' }} />
                    <Tooltip cursor={{ fill: 'rgba(8, 145, 178, 0.02)' }} contentStyle={{ background: 'var(--ds-dark)', border: 'none', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.2)', color: '#fff' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                    <Bar dataKey="Organik" stackId="a" fill="#10B981" radius={[0, 0, 4, 4]} barSize={32} />
                    <Bar dataKey="Anorganik" stackId="a" fill="var(--ds-accent)" />
                    <Bar dataKey="Residu" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)', marginBottom: 24, letterSpacing: '-0.3px' }}>Komposisi Sampah</h3>
              <div style={{ height: 260, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--ds-dark)', border: 'none', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.2)', color: '#fff' }} formatter={(value) => `${value} Kg`} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)', marginBottom: 20, letterSpacing: '-0.3px' }}>Log Pencatatan Sampah Terbaru</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--ds-border)', color: 'var(--ds-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Tanggal</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Pengguna</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Kategori</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Jenis</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Berat</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {unitDeposits.slice(0, 5).map((d, i) => (
                <tr key={d.id} style={{ borderBottom: '1px solid rgba(203, 213, 225, 0.4)', background: i % 2 === 0 ? 'white' : '#FAFCFD' }}>
                  <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: 'var(--ds-text)' }}>{d.date}</td>
                  <td style={{ padding: '14px 18px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--ds-text)' }}>{d.user}</td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ background: d.category === 'Organik' ? 'rgba(16, 185, 129, 0.08)' : d.category === 'Anorganik' ? 'rgba(8, 145, 178, 0.08)' : 'rgba(245, 158, 11, 0.08)', color: d.category === 'Organik' ? '#047857' : d.category === 'Anorganik' ? '#0891B2' : '#b45309', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700 }}>
                      {d.category}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: 'var(--ds-text)' }}>{d.jenis}</td>
                  <td style={{ padding: '14px 18px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--ds-text)' }}>{Number(d.weight).toFixed(1)} Kg</td>
                  <td style={{ padding: '14px 18px' }}><StatusBadge status={d.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderWasteMonitoring = () => (
    <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ds-text-muted)' }} />
            <input type="text" placeholder="Cari klien..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setTablePage(1); }}
              style={{ width: '100%', padding: '11px 14px 11px 40px', border: '1.5px solid var(--ds-border)', borderRadius: 12, fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', color: 'var(--ds-text)' }} />
          </div>
          <input type="date" value={dateFilter} onChange={e => { setDateFilter(e.target.value); setTablePage(1); }}
            style={{ padding: '11px 14px', border: '1.5px solid var(--ds-border)', borderRadius: 12, fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', color: 'var(--ds-text)', background: 'white' }} />
          <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setTablePage(1); }}
            style={{ padding: '11px 14px', border: '1.5px solid var(--ds-border)', borderRadius: 12, fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', color: 'var(--ds-text)', background: 'white' }}>
            <option value="">Semua Kategori</option>
            {KATEGORI_SAMPAH.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--ds-text-muted)', fontWeight: 600 }}>Aksi:</span>
        <button disabled={!selectedRow} onClick={() => selectedRow && handleEdit(selectedRow, 'deposit')} style={{ padding: '8px 16px', background: selectedRow ? '#F1F5F9' : '#F8FAFC', color: selectedRow ? '#0F172A' : '#94A3B8', border: '1px solid var(--ds-border)', borderRadius: 8, cursor: selectedRow ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}>Edit</button>
        <button disabled={!selectedRow} onClick={() => selectedRow && handleDelete(selectedRow.id, 'deposit')} style={{ padding: '8px 16px', background: selectedRow ? '#FEE2E2' : '#F8FAFC', color: selectedRow ? '#EF4444' : '#94A3B8', border: '1px solid var(--ds-border)', borderRadius: 8, cursor: selectedRow ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}>Hapus</button>

      </div>
      <div style={{ overflowX: 'auto', minHeight: 400 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--ds-border)', color: 'var(--ds-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '14px 18px', width: 40 }}></th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Tanggal/Waktu</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Unit</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Kategori</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Jenis</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Pengelola</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Berat</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDeposits.map((d, i) => (
              <tr key={d.id} onClick={() => setSelectedRow(selectedRow?.id === d.id ? null : d)} style={{ borderBottom: '1px solid rgba(203, 213, 225, 0.4)', background: selectedRow?.id === d.id ? '#F0F9FF' : (i % 2 === 0 ? 'white' : '#FAFCFD'), cursor: 'pointer', transition: 'background 0.2s' }}>
                <td style={{ padding: '14px 18px' }}>
                  <input type="radio" checked={selectedRow?.id === d.id} onChange={() => setSelectedRow(d)} style={{ cursor: 'pointer' }} />
                </td>
                <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: 'var(--ds-text)' }}>{d.date} <span style={{ color: 'var(--ds-text-muted)', fontSize: '0.8rem' }}>{d.time}</span></td>
                <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: 'var(--ds-text)' }}>{d.unit}</td>
                <td style={{ padding: '14px 18px' }}>
                  <span style={{ background: d.category === 'Organik' ? 'rgba(16, 185, 129, 0.08)' : d.category === 'Anorganik' ? 'rgba(8, 145, 178, 0.08)' : 'rgba(245, 158, 11, 0.08)', color: d.category === 'Organik' ? '#047857' : d.category === 'Anorganik' ? '#0891B2' : '#b45309', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700 }}>
                    {d.category}
                  </span>
                </td>
                <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: 'var(--ds-text)' }}>{d.jenis}</td>
                <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: 'var(--ds-text)' }}>{d.pengelola}</td>
                <td style={{ padding: '14px 18px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--ds-text)' }}>{Number(d.weight).toFixed(1)} Kg</td>
                <td style={{ padding: '14px 18px' }}><StatusBadge status={d.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={tablePage} total={totalTablePages} onChange={setTablePage} totalItems={filteredDeposits.length} />
    </div>
  );

  const renderLaporan = () => {
    const filteredLaporanDeposits = filterDataBerdasarkanWaktu(unitDeposits, laporanFilter);

    // Hitung statistik untuk dashboard
    const grouped = filteredLaporanDeposits.reduce((acc, d) => {
      if (!acc[d.pengelola]) acc[d.pengelola] = { total: 0, count: 0, Organik: 0, Anorganik: 0, Residu: 0 };
      acc[d.pengelola].total += (Number(d.weight) || 0);
      acc[d.pengelola].count += 1;
      acc[d.pengelola][d.category] += (Number(d.weight) || 0);
      return acc;
    }, {});

    const grandTotalOrganik = Object.values(grouped).reduce((s, d) => s + d.Organik, 0);
    const grandTotalAnorganik = Object.values(grouped).reduce((s, d) => s + d.Anorganik, 0);
    const grandTotalResidu = Object.values(grouped).reduce((s, d) => s + d.Residu, 0);

    const trendDataMap = new Map();
    filteredLaporanDeposits.forEach(d => {
      const entri = trendDataMap.get(d.date) || { date: d.date, Organik: 0, Anorganik: 0, Residu: 0 };
      entri[d.category] += (Number(d.weight) || 0);
      trendDataMap.set(d.date, entri);
    });

    const reportTrendChartData = Array.from(trendDataMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(item => ({
        ...item,
        labelTanggal: new Date(item.date + 'T00:00:00').toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
      }));

    const subtextLabel = laporanFilter === 'hari' ? 'Hari Ini' : laporanFilter === 'minggu' ? 'Minggu Ini' : laporanFilter === 'bulan' ? 'Bulan Ini' : 'Semua';

    const handleExportExcel = async () => {
    if (unitDeposits.length === 0) return alert('Tidak ada data.');
    
    const NAMA_BULAN_INDO = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const sheetsData = {};

    // Ringkasan Laporan
    const ringkasanBulanan = unitDeposits.reduce((acc, d) => {
      const date = new Date(d.date);
      if (isNaN(date.getTime())) return acc;
      const bulanTahun = `${NAMA_BULAN_INDO[date.getMonth()]} ${date.getFullYear()}`;
      if (!acc[bulanTahun]) acc[bulanTahun] = { sortKey: date.getFullYear() * 100 + date.getMonth(), Organik: 0, Anorganik: 0, Residu: 0, Unit: new Set() };
      acc[bulanTahun][d.category] = (acc[bulanTahun][d.category] || 0) + (Number(d.weight) || 0);
      acc[bulanTahun].Unit.add(d.pengelola);
      return acc;
    }, {});

    sheetsData["Ringkasan"] = Object.entries(ringkasanBulanan).sort((a,b) => a[1].sortKey - b[1].sortKey).map(([bulan, data]) => ({
      'Periode': bulan,
      'Total Organik (Kg)': data.Organik.toFixed(1),
      'Total Anorganik (Kg)': data.Anorganik.toFixed(1),
      'Total Residu (Kg)': data.Residu.toFixed(1),
      'Total Keseluruhan (Kg)': (data.Organik + data.Anorganik + data.Residu).toFixed(1),
      'Jumlah Pengelola': data.Unit.size
    }));

    // Neraca Sampah
    const neracaBerdasarkanUnit = neraca.filter(n => !userUnit || n.unit === userUnit);
    sheetsData["Neraca_Sampah"] = neracaBerdasarkanUnit.map(n => ({
      'Bulan': n.month,
      'Kategori': n.category,
      'Jenis Sampah': n.jenis,
      'Timbulan (Kg)': Number(n.timbulan).toFixed(1),
      'Dimanfaatkan (Kg)': Number(n.dimanfaatkan).toFixed(1),
      'Persentase Pemanfaatan': (Number(n.dimanfaatkan) / Number(n.timbulan) * 100 || 0).toFixed(1) + '%',
      'Unit Kerja': n.unit
    }));

    // Kinerja Per Unit
    const dataKinerja = unitDeposits.reduce((acc, d) => {
      if (!acc[d.pengelola]) acc[d.pengelola] = { total: 0, count: 0, Organik: 0, Anorganik: 0, Residu: 0 };
      acc[d.pengelola].total += Number(d.weight);
      acc[d.pengelola].count += 1;
      acc[d.pengelola][d.category] = (acc[d.pengelola][d.category] || 0) + Number(d.weight);
      return acc;
    }, {});
    
    sheetsData["Kinerja_Per_Unit"] = Object.entries(dataKinerja).map(([pengelola, data]) => ({
      'Nama Pengelola / Unit': pengelola,
      'Total Transaksi': data.count,
      'Organik (Kg)': data.Organik.toFixed(1),
      'Anorganik (Kg)': data.Anorganik.toFixed(1),
      'Residu (Kg)': data.Residu.toFixed(1),
      'Total Berat Keseluruhan (Kg)': data.total.toFixed(1)
    }));

    // Detail Transaksi
    sheetsData["Detail_Transaksi"] = [...unitDeposits].sort((a, b) => a.date.localeCompare(b.date)).map(d => ({
      'Tanggal': d.date, 
      'Pengelola': d.pengelola, 
      'Kategori': d.category, 
      'Jenis': d.jenis, 
      'Berat (Kg)': Number(d.weight).toFixed(1)
    }));

    // Data Pemanfaatan
    try {
      const pemRes = await fetch('/api/input-program');
      const pemData = await pemRes.json();
      if (pemData.success && pemData.data.length > 0) {
        sheetsData["Data_Pemanfaatan_Raw"] = pemData.data.map(d => {
          const row = {
            'Tanggal': d.date,
            'Waktu': d.time,
            'Pengelola / User': d.user,
            'Unit': d.unit,
            'Nama Program': d.program_name,
            'Kategori Sampah': d.kategori_sampah || '-',
            'Jenis Sampah': d.jenis_sampah || '-'
          };
          if (d.form_data) {
            Object.entries(d.form_data).forEach(([key, val]) => {
              row[key] = val;
            });
          }
          return row;
        });

        // Rekapitulasi per Program (seperti file Excel Keperluan)
        const programs = [...new Set(pemData.data.map(d => d.program_name))];
        const currentYear = new Date().getFullYear();
        const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

        programs.forEach(programName => {
           const progData = pemData.data.filter(d => d.program_name === programName && d.date.startsWith(`${currentYear}`));
           
           const monthlyData = {};
           progData.forEach(d => {
             const monthIdx = parseInt(d.date.substring(5, 7)) - 1;
             if (!monthlyData[monthIdx]) monthlyData[monthIdx] = { weight: 0 };
             
             let weight = 0;
             if (d.form_data) {
               const numericValues = Object.values(d.form_data).map(v => Number(v)).filter(v => !isNaN(v) && v > 0);
               if (numericValues.length > 0) weight = numericValues[0];
             }
             monthlyData[monthIdx].weight += weight;
           });

           const sheetRows = MONTHS.map((month, idx) => {
             const weightKg = monthlyData[idx] ? monthlyData[idx].weight : 0;
             const weightTon = weightKg / 1000;
             return {
                'Bulan': month,
                'Total Pemanfaatan (Kg)': weightKg,
                'Absolut (Ton)': weightTon,
                'Anggaran (Juta Rp)': 0,
                'Penghematan (Juta Rp)': 0
             }
           });
           
           const totalKg = sheetRows.reduce((sum, r) => sum + r['Total Pemanfaatan (Kg)'], 0);
           sheetRows.push({
             'Bulan': 'TOTAL',
             'Total Pemanfaatan (Kg)': totalKg,
             'Absolut (Ton)': totalKg / 1000,
             'Anggaran (Juta Rp)': 0,
             'Penghematan (Juta Rp)': 0
           });

           let safeSheetName = `P_${programName}`.substring(0, 31).replace(/[^a-zA-Z0-9]/g, '_');
           sheetsData[safeSheetName] = sheetRows;
        });
      }
    } catch (e) {
      console.error("Gagal mengambil data pemanfaatan untuk excel", e);
    }

    try {
      await exportToExcelMultiSheet(`Laporan_Bank_Sampah_Lengkap`, sheetsData);
    } catch (error) {
      console.error("Gagal ekspor:", error);
      alert("Terjadi kesalahan proses Excel.");
    }
  };

    const handleExportPDF = () => {
  if (!startDate || !endDate) {
    setError('Harus pilih rentang tanggal untuk download laporan pdf!');
    return;
  }


  
  const filtered = unitDeposits.filter(d => d.date >= startDate && d.date <= endDate);
  if (filtered.length === 0) {
    setError('Tidak ada data pada rentang tanggal tersebut.');
    return;
  }

  // Kalkulasi Ringkasan
  const ringkasan = filtered.reduce((acc, d) => {
    acc[d.category] = (acc[d.category] || 0) + Number(d.weight);
    return acc;
  }, {});
  
  // Kalkulasi Kinerja Per Unit
  const kinerja = filtered.reduce((acc, d) => {
    if (!acc[d.pengelola]) acc[d.pengelola] = { Organik: 0, Anorganik: 0, Residu: 0 };
    if (acc[d.pengelola].hasOwnProperty(d.category)) {
      acc[d.pengelola][d.category] += Number(d.weight);
    }
    return acc;
  }, {});
  
  // Format data untuk PDF
  const tables = [
    {
      title: "Ringkasan Laporan",
      columns: ['Kategori', 'Berat (Kg)'],
      body: Object.entries(ringkasan).map(([cat, val]) => [cat, val.toFixed(1)])
    },
    {
      title: "Detail Transaksi",
      columns: ['Tanggal', 'Pengelola', 'Kategori', 'Jenis', 'Berat'],
      body: filtered.map(d => [d.date, d.pengelola, d.category, d.jenis, `${Number(d.weight).toFixed(1)} Kg`])
    },
    {
      title: "Neraca Sampah",
      columns: ['Bulan', 'Kategori', 'Timbulan', 'Dimanfaatkan'],
      body: neraca.filter(n => n.month.startsWith(startDate.substring(0,7))).map(n => [n.month, n.category, n.timbulan, n.dimanfaatkan])
    },
    {
      title: "Kinerja Per Unit",
      columns: ['Pengelola', 'Organik', 'Anorganik', 'Residu'],
      body: Object.entries(kinerja).map(([p, d]) => [p, d.Organik.toFixed(1), d.Anorganik.toFixed(1), d.Residu.toFixed(1)])
    }
  ];

  exportToPDF('Laporan_Pengelolaan_Sampah', tables, { 
    periode: `${startDate} s/d ${endDate}`,
    unit: userUnit 
  });
  
  setError(null); // Reset pesan error jika berhasil
};

    return (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    {/* Box Pesan Error (Agar muncul di UI) */}
    {error && (
      <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{error}</span>
        <button onClick={() => setError(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: 800 }}>×</button>
      </div>
    )}

    <div style={{ display: 'flex', justifyContent: 'space-between', background: 'white', padding: '16px 20px', borderRadius: 12, border: '1px solid var(--ds-border)', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ position: 'relative' }}>
          <button 
            onClick={(e) => {
              const menu = e.currentTarget.nextElementSibling;
              menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
          >
            <Download size={16} /> Export
          </button>
          <div className="export-menu" style={{ display: 'none', position: 'absolute', top: '110%', left: 0, zIndex: 10, background: 'white', border: '1px solid #E2E8F0', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <button onClick={(e) => { handleExportExcel(); e.target.parentElement.style.display = 'none'; }} style={{ display: 'block', width: '100%', padding: '10px 16px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }}>Excel</button>
            <button onClick={(e) => { handleExportPDF(); e.target.parentElement.style.display = 'none'; }} style={{ display: 'block', width: '100%', padding: '10px 16px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }}>PDF</button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#F8FAFC', padding: '4px', borderRadius: 8, border: '1px solid #E2E8F0' }}>
          <input type="date" onChange={(e) => setStartDate(e.target.value)} style={{ background: 'transparent', border: 'none', padding: '4px 8px', fontSize: '0.8rem', outline: 'none' }} />
          <span style={{ color: '#94A3B8' }}>—</span>
          <input type="date" onChange={(e) => setEndDate(e.target.value)} style={{ background: 'transparent', border: 'none', padding: '4px 8px', fontSize: '0.8rem', outline: 'none' }} />
        </div>
      </div>

        {/* KANAN: Filter Periode */}
        <select value={laporanFilter} onChange={e => setLaporanFilter(e.target.value)} style={{ padding: '6px 12px', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: '0.82rem', cursor: 'pointer', background: 'white' }}>
          <option value="semua">Semua</option>
          <option value="hari">Hari Ini</option>
          <option value="minggu">Minggu Ini</option>
          <option value="bulan">Bulan Ini</option>
        </select>
      </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          <div style={{ background: '#D1FAE5', borderRadius: 20, padding: 24, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Leaf size={22} color="#047857" />
              <p style={{ fontSize: '0.88rem', color: '#047857', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Organik ({subtextLabel})</p>
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#065F46', margin: 0 }}>{formatWeightTon(grandTotalOrganik)}</h3>
          </div>
          <div style={{ background: 'rgba(8, 145, 178, 0.08)', borderRadius: 20, padding: 24, border: '1px solid rgba(8, 145, 178, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Recycle size={22} color="#0891B2" />
              <p style={{ fontSize: '0.88rem', color: '#0891B2', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Anorganik ({subtextLabel})</p>
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#0e7490', margin: 0 }}>{formatWeightTon(grandTotalAnorganik)}</h3>
          </div>
          <div style={{ background: '#FEF3C7', borderRadius: 20, padding: 24, border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Trash2 size={22} color="#b45309" />
              <p style={{ fontSize: '0.88rem', color: '#b45309', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Residu ({subtextLabel})</p>
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#92400E', margin: 0 }}>{formatWeightTon(grandTotalResidu)}</h3>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)', marginBottom: 20, letterSpacing: '-0.3px' }}>Grafik Tren Volume Timbulan Sampah ({subtextLabel})</h3>
          <div style={{ height: 280 }}>
            {reportTrendChartData.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ds-text-muted)', fontSize: '0.9rem' }}>Tidak ada data aktivitas untuk membuat kurva tren.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={reportTrendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOrganik" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10B981" stopOpacity={0}/></linearGradient>
                    <linearGradient id="colorAnorganik" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0891B2" stopOpacity={0.2}/><stop offset="95%" stopColor="#0891B2" stopOpacity={0}/></linearGradient>
                    <linearGradient id="colorResidu" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2}/><stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                  <XAxis dataKey="labelTanggal" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--ds-text-muted)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--ds-text-muted)' }} />
                  <Tooltip contentStyle={{ background: 'var(--ds-dark)', border: 'none', borderRadius: 12, color: '#fff' }} formatter={(val) => `${val} Kg`} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Area type="monotone" dataKey="Organik" stroke="#10B981" fillOpacity={1} fill="url(#colorOrganik)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Anorganik" stroke="#0891B2" fillOpacity={1} fill="url(#colorAnorganik)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Residu" stroke="#F59E0B" fillOpacity={1} fill="url(#colorResidu)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)', marginBottom: 20, letterSpacing: '-0.3px' }}>Rincian Per Unit / Pengelola</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--ds-border)', color: 'var(--ds-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Pengelola</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Total Transaksi</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Organik</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Anorganik</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Residu</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--ds-text)' }}>Total Berat</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(grouped).map(([pengelola, data], i) => (
                  <tr key={pengelola} style={{ borderBottom: '1px solid rgba(203, 213, 225, 0.4)', background: i % 2 === 0 ? 'white' : '#FAFCFD' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 700, fontSize: '0.9rem', color: 'var(--ds-text)' }}>{pengelola}</td>
                    <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: 'var(--ds-text)' }}>{data.count}</td>
                    <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: '#10B981', fontWeight: 600 }}>{formatWeightTon(data.Organik)}</td>
                    <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: '#0891B2', fontWeight: 600 }}>{formatWeightTon(data.Anorganik)}</td>
                    <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: '#F59E0B', fontWeight: 600 }}>{formatWeightTon(data.Residu)}</td>
                    <td style={{ padding: '14px 18px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--ds-text)' }}>{formatWeightTon(data.total)}</td>
                  </tr>
                ))}
                {Object.keys(grouped).length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ padding: '24px 18px', textAlign: 'center', color: 'var(--ds-text-muted)' }}>Tidak ada data laporan untuk rentang waktu ini.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderNeraca = () => {
  const filteredNeraca = neraca.filter(n => {
    const matchMonth = n.month === selectedBulan;
    const matchUnit = !userUnit || n.unit === userUnit;
    return matchMonth && matchUnit;
  });

  return (
    <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)', margin: 0, letterSpacing: '-0.3px' }}>
            Neraca Sampah Bulanan - Unit {userUnit === 'Wonogiri' ? 'PLTA Wonogiri' : (userUnit === 'Banjarnegara' ? 'PLTA PB.Soedirman' : userUnit || 'Semua Unit')}
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--ds-text-muted)' }}>
            Menampilkan data timbulan dan pemanfaatan sampah
          </p>
        </div>
        
        <select value={selectedBulan} onChange={e => setSelectedBulan(e.target.value)}
          style={{ padding: '8px 14px', border: '1.5px solid var(--ds-border)', borderRadius: 10, fontSize: '0.88rem', outline: 'none', background: 'white', fontFamily: 'inherit', color: 'var(--ds-text)', cursor: 'pointer' }}>
          <option value="2026-07">Juli 2026</option>
          <option value="2026-06">Juni 2026</option>
        </select>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--ds-border)', color: 'var(--ds-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Kategori</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Jenis Sampah</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Timbulan (Kg)</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Yang Dimanfaatkan (Kg)</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Persentase</th>
            </tr>
          </thead>
          <tbody>
            {filteredNeraca.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '24px 18px', textAlign: 'center', color: 'var(--ds-text-muted)', fontSize: '0.9rem' }}>
                  Tidak ada data neraca sampah untuk unit dan periode ini.
                </td>
              </tr>
            ) : (
              filteredNeraca.map((n, i) => {
                const timb = Number(n.timbulan) || 0;
                const diman = Number(n.dimanfaatkan) || 0;
                const perc = timb > 0 ? (diman / timb) * 100 : 0;
                return (
                  <tr key={n.id} style={{ borderBottom: '1px solid rgba(203, 213, 225, 0.4)', background: i % 2 === 0 ? 'white' : '#FAFCFD' }}>
                    <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: 'var(--ds-text)' }}>{n.category}</td>
                    <td style={{ padding: '14px 18px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--ds-text)' }}>{n.jenis}</td>
                    <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: 'var(--ds-text)' }}>{timb.toFixed(1)}</td>
                    <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: '#047857', fontWeight: 600 }}>{diman.toFixed(1)}</td>
                    <td style={{ padding: '14px 18px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--ds-text)' }}>{perc.toFixed(1)}%</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

  const renderBuktiBayar = () => (
    <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)', margin: 0, letterSpacing: '-0.3px' }}>Bukti Bayar Tahunan</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--ds-text-muted)' }}>Kelola status persetujuan kwitansi bulanan per tahun</p>
        </div>
        
        <select value={selectedTahunBukti} onChange={e => setSelectedTahunBukti(e.target.value)}
          style={{ padding: '9px 14px', border: '1.5px solid var(--ds-border)', borderRadius: 10, fontSize: '0.88rem', outline: 'none', background: 'white', color: 'var(--ds-text)', fontFamily: 'inherit', cursor: 'pointer' }}>
          <option value="2026">Tahun 2026</option>
          <option value="2025">Tahun 2025</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 14 }}>
        {DAFTAR_BULAN.map(bulan => {
          const targetKey = `${selectedTahunBukti}-${bulan.id}`;
          const b = unitBuktiBayar.find(item => item.month === targetKey);

          return (
            <div key={bulan.id} style={{ border: '1px solid var(--ds-border)', borderRadius: 12, padding: '14px', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.01)', display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--ds-text)', display: 'block', marginBottom: 4 }}>{bulan.nama}</span>
                {b ? <StatusBadge status={b.status} /> : <span style={{ fontSize: '0.72rem', color: 'var(--ds-text-muted)', fontWeight: 500 }}>Belum Ada Data</span>}
              </div>
              
              <div style={{ marginTop: 4 }}>
                {b && b.img_url ? (
                  <button onClick={() => setActiveKwitansiPopup(b)} 
                    style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#E0F2FE', color: '#0284C7', border: 'none', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, transition: 'all 0.2s' }}
                    onMouseEnter={e => e.target.style.background = '#BAE6FD'}
                    onMouseLeave={e => e.target.style.background = '#E0F2FE'}
                  >
                    <Eye size={12} /> Tinjau Kwitansi
                  </button>
                ) : (
                  <button disabled style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#F1F5F9', color: '#94A3B8', border: '1px solid var(--ds-border)', padding: '8px 12px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 500, cursor: 'not-allowed' }}>
                    Klien Belum Upload
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderInventarisasi = () => (
    <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)', margin: 0, letterSpacing: '-0.3px' }}>Inventarisasi Sampah Historis</h3>
        <select value={selectedTahunHistoris} onChange={e => setSelectedTahunHistoris(e.target.value)}
          style={{ padding: '8px 14px', border: '1.5px solid var(--ds-border)', borderRadius: 10, fontSize: '0.88rem', outline: 'none', background: 'white', fontFamily: 'inherit', color: 'var(--ds-text)' }}>
          <option value="2026">Tahun 2026</option>
          <option value="2025">Tahun 2025</option>
          <option value="2024">Tahun 2024</option>
          <option value="2023">Tahun 2023</option>
          <option value="2022">Tahun 2022</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--ds-text-muted)', fontWeight: 600 }}>Aksi:</span>
        <button disabled={!selectedRow} onClick={() => selectedRow && handleEdit(selectedRow, 'inventarisasi')} style={{ padding: '8px 16px', background: selectedRow ? '#F1F5F9' : '#F8FAFC', color: selectedRow ? '#0F172A' : '#94A3B8', border: '1px solid var(--ds-border)', borderRadius: 8, cursor: selectedRow ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}>Edit</button>
        <button disabled={!selectedRow} onClick={() => selectedRow && handleDelete(selectedRow.id, 'inventarisasi')} style={{ padding: '8px 16px', background: selectedRow ? '#FEE2E2' : '#F8FAFC', color: selectedRow ? '#EF4444' : '#94A3B8', border: '1px solid var(--ds-border)', borderRadius: 8, cursor: selectedRow ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}>Hapus</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--ds-border)', color: 'var(--ds-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '14px 18px', width: 40 }}></th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Kategori</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Jenis Sampah</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Timbulan (Ton)</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Dimanfaatkan (Ton)</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Residu ke TPA (Ton)</th>
            </tr>
          </thead>
          <tbody>
            {inventarisasi.filter(inv => inv.tahun === selectedTahunHistoris).map((inv, i) => (
              <tr key={inv.id} onClick={() => setSelectedRow(selectedRow?.id === inv.id ? null : inv)} style={{ borderBottom: '1px solid rgba(203, 213, 225, 0.4)', background: selectedRow?.id === inv.id ? '#F0F9FF' : (i % 2 === 0 ? 'white' : '#FAFCFD'), cursor: 'pointer', transition: 'background 0.2s' }}>
                <td style={{ padding: '14px 18px' }}>
                  <input type="radio" checked={selectedRow?.id === inv.id} onChange={() => setSelectedRow(inv)} style={{ cursor: 'pointer' }} />
                </td>
                <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: 'var(--ds-text)' }}>{inv.category}</td>
                <td style={{ padding: '14px 18px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--ds-text)' }}>{inv.jenis}</td>
                <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: 'var(--ds-text)' }}>{Number(inv.timbulan).toFixed(3)}</td>
                <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: '#047857', fontWeight: 600 }}>{Number(inv.dimanfaatkan).toFixed(3)}</td>
                <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: '#DC2626', fontWeight: 600 }}>{Number(inv.residu_tpa).toFixed(3)}</td>
              </tr>
            ))}
            {inventarisasi.filter(inv => inv.tahun === selectedTahunHistoris).length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: 'var(--ds-text-muted)' }}>Belum ada data inventarisasi untuk tahun ini.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRekapProgram = () => (
    <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)', margin: 0, letterSpacing: '-0.3px' }}>Rekapitulasi Program Pengelolaan Sampah</h3>
        <select value={selectedTahunHistoris} onChange={e => setSelectedTahunHistoris(e.target.value)}
          style={{ padding: '8px 14px', border: '1.5px solid var(--ds-border)', borderRadius: 10, fontSize: '0.88rem', outline: 'none', background: 'white', fontFamily: 'inherit', color: 'var(--ds-text)' }}>
          <option value="2026">Tahun 2026</option>
          <option value="2025">Tahun 2025</option>
          <option value="2024">Tahun 2024</option>
          <option value="2023">Tahun 2023</option>
          <option value="2022">Tahun 2022</option>
          <option value="2021">Tahun 2021</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--ds-text-muted)', fontWeight: 600 }}>Aksi:</span>
        <button disabled={!selectedRow} onClick={() => selectedRow && handleEdit(selectedRow, 'rekap')} style={{ padding: '8px 16px', background: selectedRow ? '#F1F5F9' : '#F8FAFC', color: selectedRow ? '#0F172A' : '#94A3B8', border: '1px solid var(--ds-border)', borderRadius: 8, cursor: selectedRow ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}>Edit</button>
        <button disabled={!selectedRow} onClick={() => selectedRow && handleDelete(selectedRow.id, 'rekap')} style={{ padding: '8px 16px', background: selectedRow ? '#FEE2E2' : '#F8FAFC', color: selectedRow ? '#EF4444' : '#94A3B8', border: '1px solid var(--ds-border)', borderRadius: 8, cursor: selectedRow ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}>Hapus</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--ds-border)', color: 'var(--ds-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '14px 18px', width: 40 }}></th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Nama Program</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Jenis Sampah</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Kegiatan</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Absolut (Ton)</th>
            </tr>
          </thead>
          <tbody>
            {rekapProgram.filter(rp => rp.tahun === selectedTahunHistoris).map((rp, i) => (
              <tr key={rp.id} onClick={() => setSelectedRow(selectedRow?.id === rp.id ? null : rp)} style={{ borderBottom: '1px solid rgba(203, 213, 225, 0.4)', background: selectedRow?.id === rp.id ? '#F0F9FF' : (i % 2 === 0 ? 'white' : '#FAFCFD'), cursor: 'pointer', transition: 'background 0.2s' }}>
                <td style={{ padding: '14px 18px' }}>
                  <input type="radio" checked={selectedRow?.id === rp.id} onChange={() => setSelectedRow(rp)} style={{ cursor: 'pointer' }} />
                </td>
                <td style={{ padding: '14px 18px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--ds-text)' }}>{rp.nama_program}</td>
                <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: 'var(--ds-text)' }}>{rp.jenis_sampah}</td>
                <td style={{ padding: '14px 18px', fontSize: '0.85rem' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', background: rp.jenis_kegiatan === 'Pemanfaatan' ? '#ECFCCB' : '#DBEAFE', color: rp.jenis_kegiatan === 'Pemanfaatan' ? '#4D7C0F' : '#1D4ED8', fontWeight: 600 }}>{rp.jenis_kegiatan}</span>
                </td>
                <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: '#047857', fontWeight: 700 }}>{Number(rp.absolut_ton).toFixed(3)}</td>
              </tr>
            ))}
            {rekapProgram.filter(rp => rp.tahun === selectedTahunHistoris).length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--ds-text-muted)' }}>Belum ada rekapitulasi program untuk tahun ini.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--ds-bg)', fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}>
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="sidebar-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(12, 26, 46, 0.4)',
            zIndex: 45,
            backdropFilter: 'blur(4px)'
          }}
        />
      )}

      {/* Sidebar Container */}
      <div className={`sidebar-container ${!sidebarOpen ? 'closed' : ''} ${sidebarOpen ? 'open' : ''}`} style={{
        width: 260, background: 'var(--ds-dark)', color: 'white', display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, bottom: 0, zIndex: 50,
        boxShadow: '4px 0 30px rgba(0,0,0,0.15)'
      }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ background: 'white', padding: 6, borderRadius: 8, display: 'flex' }}><PLNLogo size={42} unit={userUnit} /></div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, lineHeight: 1.2, letterSpacing: '-0.5px' }}>Powercycle</h1>
            <p style={{ fontSize: '0.72rem', color: 'var(--ds-accent-light)', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {role ? (role === 'admin sis' ? 'Admin SIS' : 'Admin LLK') : 'Admin Portal'} • {userUnit === 'Wonogiri' ? 'PLTA Wonogiri' : (userUnit === 'Banjarnegara' ? 'PLTA PB.Soedirman' : userUnit || 'Pusat')}
            </p>
          </div>
        </div>

        <div style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
          {sidebarItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button key={item.id} onClick={() => { 
                setCurrentPage(item.id); 
                if (window.innerWidth <= 1024) setSidebarOpen(false); 
              }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                  background: isActive ? 'rgba(8, 145, 178, 0.15)' : 'transparent', border: 'none', borderRadius: 12,
                  color: isActive ? 'white' : 'rgba(255,255,255,0.65)', cursor: 'pointer', textAlign: 'left',
                  fontSize: '0.88rem', fontWeight: isActive ? 700 : 500, transition: 'all 0.2s',
                  fontFamily: 'inherit'
                }}>
                <Icon size={18} style={{ color: isActive ? 'var(--ds-accent-light)' : 'currentColor' }} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className={`main-content ${!sidebarOpen ? 'sidebar-closed' : ''}`} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh', transition: 'margin 0.3s ease' }}>
        <header style={{ background: 'white', padding: '16px 28px', borderBottom: '1px solid var(--ds-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ds-text)' }}>
              <Menu size={24} />
            </button>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--ds-text)', letterSpacing: '-0.5px' }}>{pageTitles[currentPage]}</h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--ds-text-muted)', fontWeight: 500 }}>Bank Sampah Digital {userUnit ? (userUnit === 'Wonogiri' ? ' • PLTA Wonogiri' : (userUnit === 'Banjarnegara' ? ' • PLTA PB.Soedirman' : ' • Unit ' + userUnit)) : ''}</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: 'var(--ds-text)', color: 'white', padding: '8px 18px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Administrator
            </div>

            {/* Modal Tolak Bukti */}
{rejectTarget && (
  <div style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(12, 26, 46, 0.6)', backdropFilter: 'blur(4px)' }}>
    <div style={{ background: 'white', width: 400, borderRadius: '1.5rem', padding: 32 }}>
      <h3 style={{ margin: '0 0 16px' }}>Alasan Penolakan</h3>
      <textarea 
        autoFocus
        style={{ width: '100%', height: 100, padding: 12, border: '1.5px solid var(--ds-border)', borderRadius: 12, marginBottom: 16 }}
        placeholder="Tulis alasan penolakan di sini..."
        onChange={(e) => setRejectReason(e.target.value)}
      />
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => setRejectTarget(null)} style={{ flex: 1, padding: 12, borderRadius: 99, border: '1px solid #E2E8F0', background: 'white' }}>Batal</button>
        <button onClick={() => { onUpdateBuktiStatus(rejectTarget, 'Ditolak', rejectReason); setRejectTarget(null); setRejectReason(''); }} 
          style={{ flex: 1, padding: 12, borderRadius: 99, background: '#EF4444', color: 'white', border: 'none' }}>Kirim Penolakan</button>
      </div>
    </div>
  </div>
)}

{/* Modal Konfirmasi Hapus */}
{deleteTarget && (
  <div style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(12, 26, 46, 0.6)', backdropFilter: 'blur(4px)' }}>
    <div style={{ background: 'white', width: 360, borderRadius: '1.5rem', padding: 32, textAlign: 'center' }}>
      <Trash2 size={48} color="#EF4444" style={{ marginBottom: 16 }} />
      <h3>Hapus Bukti?</h3>
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button onClick={() => setDeleteTarget(null)} style={{ flex: 1, padding: 12, borderRadius: 99, background: '#F1F5F9' }}>Batal</button>
        <button onClick={() => { onDeleteBuktiBayar(deleteTarget); setDeleteTarget(null); }} style={{ flex: 1, padding: 12, borderRadius: 99, background: '#EF4444', color: 'white' }}>Hapus</button>
      </div>
    </div>
  </div>
)}

            <button onClick={() => setShowLogoutConfirm(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
                background: '#FEE2E2', color: '#EF4444', border: 'none', borderRadius: '9999px',
                cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, transition: 'all 0.2s',
                fontFamily: 'inherit'
              }}
              onMouseEnter={e => e.target.style.background = '#FCA5A5'}
              onMouseLeave={e => e.target.style.background = '#FEE2E2'}
            >
              <LogOut size={16} /> Keluar
            </button>
          </div>
        </header>

        <main style={{ padding: 28, flex: 1 }}>
          {currentPage === 'dashboard' && renderDashboard()}
          {currentPage === 'waste-monitoring' && renderWasteMonitoring()}
          {currentPage === 'reports' && renderLaporan()}
          {currentPage === 'neraca' && renderNeraca()}
          {currentPage === 'inventarisasi' && renderInventarisasi()}
          {currentPage === 'rekap-program' && renderRekapProgram()}
          {currentPage === 'bukti-bayar' && renderBuktiBayar()}
          
          {currentPage === 'master-data' && <MasterDataManagement />}
          {currentPage === 'manajemen-program' && <ManajemenProgram />}
          {currentPage === 'data-pemanfaatan' && <DataPemanfaatan />}

          {currentPage === 'pengelola-data' && (
            <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)', marginBottom: 20, letterSpacing: '-0.3px' }}>Data Pengelola</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--ds-border)', color: 'var(--ds-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <th style={{ padding: '14px 18px', fontWeight: 700 }}>Nama Pengelola</th>
                      <th style={{ padding: '14px 18px', fontWeight: 700 }}>Total Sampah Dikelola (Kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(deposits.reduce((acc, dep) => {
                      acc[dep.pengelola] = (acc[dep.pengelola] || 0) + Number(dep.weight);
                      return acc;
                    }, {})).map(([pengelola, total], i) => (
                      <tr key={pengelola} style={{ borderBottom: '1px solid rgba(203, 213, 225, 0.4)', background: i % 2 === 0 ? 'white' : '#FAFCFD' }}>
                        <td style={{ padding: '14px 18px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--ds-text)' }}>{pengelola}</td>
                        <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: '#047857', fontWeight: 600 }}>{total.toFixed(2)} Kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Pop-up Modal Tinjau Kwitansi Admin */}
{activeKwitansiPopup && (
  <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(12, 26, 46, 0.6)', backdropFilter: 'blur(4px)' }}>
    <div style={{ background: 'white', width: '100%', maxWidth: 500, borderRadius: '1.5rem', padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ margin: 0 }}>Tinjau Kwitansi</h3>
        <button onClick={() => setActiveKwitansiPopup(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>&times;</button>
      </div>

      <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 15 }}>
        <div>Unit: <strong>{activeKwitansiPopup.unit}</strong></div>
        <div>Invoice: <strong>{activeKwitansiPopup.no_bukti}</strong></div>
        <div>Upload: <strong>{new Date(activeKwitansiPopup.created_at).toLocaleString()}</strong></div>
        {activeKwitansiPopup.status !== 'Pending' && (
          <div>Verifikasi: <strong>{new Date(activeKwitansiPopup.updated_at).toLocaleString()}</strong></div>
        )}
        {activeKwitansiPopup.remarks && (
          <div style={{ background: '#FEF2F2', padding: 8, borderRadius: 8, color: '#991B1B' }}>
            Alasan Ditolak: <strong>{activeKwitansiPopup.remarks}</strong>
          </div>
        )}
      </div>

      <div style={{ position: 'relative', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
  <img 
    src={activeKwitansiPopup.img_url} 
    alt="Kwitansi" 
    style={{ width: '100%', maxHeight: 250, objectFit: 'contain', cursor: 'pointer' }}
    onClick={() => setFullImage(activeKwitansiPopup.img_url)} // Klik gambar untuk zoom
  />
  
  <div style={{ position: 'absolute', bottom: 10, right: 10, display: 'flex', gap: 8 }}>
    <button 
      onClick={() => setFullImage(activeKwitansiPopup.img_url)} 
      style={{ padding: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
    >
      <Maximize2 size={18} />
    </button>
    <a href={activeKwitansiPopup.img_url} download={`Bukti_${activeKwitansiPopup.no_bukti}.png`} 
       style={{ padding: '8px', background: '#0891B2', color: 'white', borderRadius: 8 }}>
      <Download size={18} />
    </a>
  </div>
</div>

      {activeKwitansiPopup.status === 'Pending' && onUpdateBuktiStatus && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <button onClick={() => { onUpdateBuktiStatus(activeKwitansiPopup.id, 'Lunas'); setActiveKwitansiPopup(null); }}
            style={{ flex: 1, padding: '12px', background: '#10B981', color: 'white', border: 'none', borderRadius: '9999px', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
          >Setujui Pembayaran</button>
          
          {/* MENGGUNAKAN STATE KUSTOM BUKAN PROMPT */}
          <button onClick={() => { setRejectTarget(activeKwitansiPopup.id); setActiveKwitansiPopup(null); }}
            style={{ flex: 1, padding: '12px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '9999px', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
          >Tolak</button>
        </div>
      )}
      
      <button onClick={() => setActiveKwitansiPopup(null)} style={{ width: '100%', padding: '12px', background: '#F1F5F9', color: 'var(--ds-text)', border: '1px solid var(--ds-border)', borderRadius: '9999px', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer' }}>
        Kembali
      </button>
    </div>
  </div>
)}

{fullImage && (
  <div 
    onClick={() => setFullImage(null)} // Klik di mana saja untuk menutup
    style={{
      position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.9)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}
  >
    <img src={fullImage} style={{ maxWidth: '95%', maxHeight: '95%', objectFit: 'contain' }} />
    <button style={{ position: 'absolute', top: 20, right: 20, background: 'white', border: 'none', padding: '10px', borderRadius: '50%', cursor: 'pointer' }}>
      <X size={24} />
    </button>
  </div>
)}

{/* Modal Alasan Penolakan */}
{rejectTarget && (
  <div style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(12, 26, 46, 0.6)', backdropFilter: 'blur(4px)' }}>
    <div style={{ background: 'white', width: 400, borderRadius: '1.5rem', padding: 32, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
      <h3 style={{ margin: '0 0 16px' }}>Alasan Penolakan</h3>
      <textarea 
        autoFocus
        style={{ width: '100%', height: 100, padding: 12, border: '1.5px solid var(--ds-border)', borderRadius: 12, marginBottom: 16, fontFamily: 'inherit' }}
        placeholder="Tulis alasan penolakan di sini..."
        onChange={(e) => setRejectReason(e.target.value)}
      />
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => setRejectTarget(null)} style={{ flex: 1, padding: 12, borderRadius: 99, border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer' }}>Batal</button>
        <button onClick={() => { 
            onUpdateBuktiStatus(rejectTarget, 'Ditolak', rejectReason); 
            setRejectTarget(null); 
            setRejectReason(''); 
        }} 
          style={{ flex: 1, padding: 12, borderRadius: 99, background: '#EF4444', color: 'white', border: 'none', cursor: 'pointer' }}>Kirim Penolakan</button>
      </div>
    </div>
  </div>
)}

      {editingItem && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(12, 26, 46, 0.6)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: 500, borderRadius: '1.5rem', padding: 32, boxShadow: '0 20px 40px rgba(0,0,0,0.1)', animation: 'scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--ds-text)', letterSpacing: '-0.5px' }}>Edit Data</h3>
              <button onClick={() => setEditingItem(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--ds-text-muted)' }}>&times;</button>
            </div>
            <form onSubmit={handleEditSubmit} style={{ display: 'grid', gap: 16 }}>
              {Object.keys(editFormData).filter(k => k !== 'id' && k !== 'user' && k !== 'client' && k !== 'unit' && k !== 'timestamp').map(key => (
                <div key={key}>
                  <label style={{ display: 'block', color: 'var(--ds-text)', fontSize: '0.85rem', fontWeight: 700, marginBottom: 8, textTransform: 'capitalize', letterSpacing: '0.5px' }}>{key.replace('_', ' ')}</label>
                  <input type={key === 'weight' || key === 'timbulan' || key === 'dimanfaatkan' || key === 'residu_tpa' || key === 'absolut_ton' ? 'number' : key === 'date' ? 'date' : 'text'} step="any"
                    value={editFormData[key] || ''} 
                    onChange={e => setEditFormData({ ...editFormData, [key]: e.target.value })}
                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--ds-border)', borderRadius: 10, fontSize: '0.9rem', outline: 'none', background: '#F8FAFC', color: 'var(--ds-text)', fontFamily: 'inherit' }} 
                  />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setEditingItem(null)} style={{ flex: 1, padding: '14px', background: 'white', color: 'var(--ds-text)', border: '1.5px solid var(--ds-border)', borderRadius: '9999px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>Batal</button>
                <button type="submit" style={{ flex: 1, padding: '14px', background: 'var(--ds-text)', color: 'white', border: 'none', borderRadius: '9999px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(12, 26, 46, 0.6)', backdropFilter: 'blur(4px)', animation: 'scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: 380, borderRadius: '1.5rem', padding: 32, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <LogOut size={32} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--ds-text)', letterSpacing: '-0.5px' }}>Konfirmasi Logout</h3>
              <p style={{ margin: '8px 0 0', color: 'var(--ds-text-muted)', fontSize: '0.9rem' }}>Apakah Anda yakin ingin keluar dari akun?</p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowLogoutConfirm(false)} style={{ flex: 1, padding: '14px', background: 'white', color: 'var(--ds-text)', border: '1.5px solid var(--ds-border)', borderRadius: '9999px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.target.style.background = '#F1F5F9'; }}
                onMouseLeave={e => { e.target.style.background = 'white'; }}
              >Batal</button>
              <button onClick={() => { setShowLogoutConfirm(false); onLogout(); }} style={{ flex: 1, padding: '14px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '9999px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                onMouseEnter={e => e.target.style.background = '#DC2626'}
                onMouseLeave={e => e.target.style.background = '#EF4444'}
              >Logout</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .sidebar-container { left: 0; }
        .main-content { margin-left: 260px; }
        .sidebar-overlay { display: none !important; }
        
        @media (max-width: 1024px) {
          .sidebar-container { left: ${sidebarOpen ? '0' : '-260px'} !important; }
          .main-content { margin-left: 0 !important; }
          .sidebar-toggle { display: block !important; }
          .sidebar-overlay { display: block !important; }
        }
      `}</style>
    </div>
  );
}
