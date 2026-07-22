'use client';
import { useState, useMemo, useEffect } from 'react';
import {
  LayoutDashboard, PlusCircle, History, Database,
  FileCheck, BarChart2, LogOut, Trash2, Calendar,
  Clock, Package, MapPin, Scale, Info, Menu, X, Upload, Eye, Maximize2, Download, Share2,
  FolderKanban, ClipboardList, ArrowLeft, CheckCircle2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  BarChart, Bar, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from 'recharts';
import {
  KATEGORI_SAMPAH,
  formatWeight, TODAY
} from '../lib/mockData';

const DAFTAR_PENGELOLA = [
  'TPA Winong',
  'TPA Banjarnegara'
];

const OPSI_JENIS_SAMPAH = {
  'Organik': ['Sisa Makanan', 'Daun dan Ranting', 'Kulit Buah/Sayur', 'Kompos Murni', 'Lainnya (Organik)'],
  'Anorganik': ['Plastik PET/Botol', 'Kertas/Kardus', 'Besi/Logam', 'Kaca/Beling', 'Karet/Ban', 'Lainnya (Anorganik)'],
  'Residu': ['Popok/Pembalut', 'Puntung Rokok', 'Lainnya (Residu)']
};

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

const PLNLogo = ({ size = 32, unit = '' }) => {
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
    'Ditolak': { bg: 'rgba(239, 68, 68, 0.08)', color: '#b91c1c', border: '1px solid rgba(239, 68, 68, 0.2)' },
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
      fontSize: '0.68rem', 
      fontWeight: 700, 
      whiteSpace: 'nowrap', 
      display: 'inline-block' 
    }}>
      {status}
    </span>
  );
}

function StatCard({ title, value, subtext }) {
  return (
    <div style={{ 
      background: 'white', 
      borderRadius: 20, 
      padding: '24px', 
      boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', 
      border: '1px solid var(--ds-border)' 
    }}>
      <p style={{ fontSize: '0.78rem', color: 'var(--ds-text-muted)', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</p>
      <p style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--ds-accent)', margin: '0 0 6px 0', letterSpacing: '-1px' }}>{value}</p>
      <p style={{ fontSize: '0.8rem', color: 'var(--ds-text-muted)', margin: 0, fontWeight: 500 }}>{subtext}</p>
    </div>
  );
}

export function UserDashboard({ deposits, neraca, buktiBayar, masterJenis, masterPengelola, onLogout, onAddDeposit, onDeleteDeposit, onUpdateDeposit, onAddBuktiBayar, onDeleteBuktiBayar, userUnit, username }) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedBulan, setSelectedBulan] = useState('2026-06');
  const [selectedTahun, setSelectedTahun] = useState('2026');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [generatedQr, setGeneratedQr] = useState(null);
  const [activeKwitansiPopup, setActiveKwitansiPopup] = useState(null);
  const [fullImage, setFullImage] = useState(null);
  
  const [dashboardFilter, setDashboardFilter] = useState('hari');
  const [riwayatFilter, setRiwayatFilter] = useState('semua');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingId, setEditingId] = useState(null);
  
  const [programsData, setProgramsData] = useState([]);
  const [selectedProgramData, setSelectedProgramData] = useState(null);
  const [programFormValues, setProgramFormValues] = useState({});
  const [loadingPrograms, setLoadingPrograms] = useState(false);

  useEffect(() => {
    if (currentPage === 'input-program' && programsData.length === 0) {
      setLoadingPrograms(true);
      fetch('/api/programs')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setProgramsData(data.data);
          }
        })
        .catch(console.error)
        .finally(() => setLoadingPrograms(false));
    }
  }, [currentPage, programsData.length]);
  
  const [formData, setFormData] = useState({
    date: TODAY, time: new Date().toTimeString().slice(0, 5),
    kategori: 'Organik', jenis: '', pengelola: '', berat: ''
  });

  const opsiJenisLokal = useMemo(() => {
    if (masterJenis && masterJenis.length > 0) {
      return masterJenis.filter(j => j.kategori === formData.kategori).map(j => j.nama_jenis);
    }
    return OPSI_JENIS_SAMPAH[formData.kategori] || [];
  }, [masterJenis, formData.kategori]);

  const [programKategori, setProgramKategori] = useState('');
  const [programJenis, setProgramJenis] = useState('');

  const programOpsiJenisLokal = useMemo(() => {
    if (masterJenis && masterJenis.length > 0) {
      return masterJenis.filter(j => j.kategori === programKategori).map(j => j.nama_jenis);
    }
    return OPSI_JENIS_SAMPAH[programKategori] || [];
  }, [masterJenis, programKategori]);

  const opsiPengelolaLokal = useMemo(() => {
    if (masterPengelola && masterPengelola.length > 0) {
      return masterPengelola.map(p => p.nama_pengelola);
    }
    return DAFTAR_PENGELOLA;
  }, [masterPengelola]);

  const myDeposits = useMemo(() => deposits.filter(d => d.user === username), [deposits, username]);
  const unitBuktiBayar = useMemo(() => buktiBayar.filter(b => !userUnit || b.unit === userUnit), [buktiBayar, userUnit]);

  const dashboardFilteredDeposits = useMemo(() => {
    return filterDataBerdasarkanWaktu(myDeposits, dashboardFilter);
  }, [myDeposits, dashboardFilter]);

  const riwayatFilteredDeposits = useMemo(() => {
    return filterDataBerdasarkanWaktu(myDeposits, riwayatFilter);
  }, [myDeposits, riwayatFilter]);

  const totalWeight = useMemo(() => {
    return myDeposits.reduce((s, d) => s + (Number(d.weight) || 0), 0);
  }, [myDeposits]);

  const todayDeposits = useMemo(() => {
    return myDeposits.filter(d => d.date === TODAY);
  }, [myDeposits]);

  const statWeightValue = useMemo(() => {
    const total = dashboardFilteredDeposits.reduce((s, d) => s + (Number(d.weight) || 0), 0);
    return formatWeight(total);
  }, [dashboardFilteredDeposits]);

  const statSubtextLabel = useMemo(() => {
    if (dashboardFilter === 'hari') return 'periode hari ini';
    if (dashboardFilter === 'minggu') return '7 hari terakhir';
    if (dashboardFilter === 'bulan') return 'periode bulan ini';
    return 'akumulasi keseluruhan';
  }, [dashboardFilter]);

  const filteredNeraca = useMemo(() => {
    return neraca.filter(n => n.month === selectedBulan && (!userUnit || n.unit === userUnit));
  }, [neraca, selectedBulan, userUnit]);

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (!formData.berat || !formData.pengelola || !formData.jenis) {
      alert("Harap lengkapi semua data!");
      return;
    }
    setShowConfirmPopup(true);
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    // Add white background for PNG
    canvas.width = 240;
    canvas.height = 240;
    
    img.onload = () => {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 20, 20, 200, 200); // 20px padding
      
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR-Setoran-${generatedQr}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleShareQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    canvas.width = 240;
    canvas.height = 240;
    
    img.onload = () => {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 20, 20, 200, 200);
      
      canvas.toBlob(async (blob) => {
        const file = new File([blob], `QR-Setoran-${generatedQr}.png`, { type: 'image/png' });
        
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: 'QR Code Setoran',
              text: `Ini QR Code setoran sampah saya (${generatedQr}).`,
              files: [file]
            });
          } catch (error) {
            console.error('Error sharing:', error);
          }
        } else {
          alert("Browser Anda tidak mendukung fitur share gambar. Silakan gunakan tombol Download.");
        }
      }, 'image/png');
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  // Handler untuk mengedit data setoran
  const handleEdit = (deposit) => {
    setEditingId(deposit.id);
    setFormData({
      date: deposit.date,
      time: deposit.time,
      kategori: deposit.category,
      jenis: deposit.jenis,
      pengelola: deposit.pengelola,
      berat: deposit.weight
    });
    setCurrentPage('input');
  };

  const handleConfirmSave = async () => {
    const depData = {
      date: formData.date, time: formData.time, user: username,
      unit: userUnit, category: formData.kategori, jenis: formData.jenis,
      pengelola: formData.pengelola, weight: parseFloat(formData.berat),
      status: 'Menunggu Validasi'
    };

    if (editingId) {
      // Update data setoran jika dalam mode edit
      await onUpdateDeposit(editingId, depData); 
      setEditingId(null);
      setFormData({ date: TODAY, time: new Date().toTimeString().slice(0, 5), kategori: 'Organik', jenis: '', pengelola: '', berat: '' });
    } else {
      const result = await onAddDeposit(depData);
      setFormData({ date: TODAY, time: new Date().toTimeString().slice(0, 5), kategori: 'Organik', jenis: '', pengelola: '', berat: '' });
      if (result && result.success) {
        setGeneratedQr(result.id);
      }
    }
    setShowConfirmPopup(false);
  };

  // Handler untuk mengunggah kwitansi per bulan
  const handleUploadKwitansiPerBulan = (e, bulanId) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newBukti = {
          id: 'B' + Date.now(),
          month: `${selectedTahun}-${bulanId}`,
          unit: userUnit || 'Wonogiri',
          no_bukti: `INV-MANUAL-${Date.now()}`,
          status: 'Pending',
          img_url: e.target.result
        };
        if (onAddBuktiBayar) onAddBuktiBayar(newBukti);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteBukti = async (id) => {
  try {
    const res = await fetch(`/api/bukti/${id}`, { method: 'DELETE' });
    
    // Proses penghapusan data bukti bayar
    if (!res.ok) {
       const errData = await res.json().catch(() => ({ error: 'Unknown Error' }));
       throw new Error(errData.error || 'Gagal menghapus');
    }
    
    const data = await res.json();
    if (data.success) {
      setBuktiBayar(prev => prev.filter(b => b.id !== id));
    }
  } catch (err) {
    console.error('Delete error:', err);
    alert(err.message);
  }
};

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'input', label: 'Input Sampah', icon: PlusCircle },
    { id: 'input-program', label: 'Input Program', icon: ClipboardList },
    { id: 'riwayat', label: 'Riwayat', icon: History },
    { id: 'neraca', label: 'Neraca Sampah', icon: Database },
    { id: 'bukti-bayar', label: 'Bukti Bayar', icon: FileCheck },
    { id: 'ringkasan', label: 'Ringkasan', icon: BarChart2 },
  ];

  const renderDashboard = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <StatCard title="Total Transaksi" value={dashboardFilteredDeposits.length} subtext={`Total input ${statSubtextLabel}`} />
        <StatCard title="Total Berat" value={statWeightValue} subtext={`Total berat disetor ${statSubtextLabel}`} />
      </div>

      <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)', margin: 0, letterSpacing: '-0.3px' }}>Setoran Terbaru Saya</h3>
            
            <select value={dashboardFilter} onChange={e => setDashboardFilter(e.target.value)}
              style={{ padding: '6px 12px', border: '1.5px solid var(--ds-border)', borderRadius: 10, fontSize: '0.82rem', outline: 'none', background: '#F8FAFC', color: 'var(--ds-text)', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
              <option value="hari">Hari Ini</option>
              <option value="minggu">Minggu Ini</option>
              <option value="bulan">Bulan Ini</option>
              <option value="semua">Semua Periode</option>
            </select>
          </div>
          
          <button onClick={() => setCurrentPage('input')} style={{ padding: '10px 20px', background: 'var(--ds-accent)', color: 'white', border: 'none', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
            onMouseEnter={e => e.target.style.background = 'var(--ds-accent-light)'}
            onMouseLeave={e => e.target.style.background = 'var(--ds-accent)'}
          >
            + Input Baru
          </button>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--ds-border)', color: 'var(--ds-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Tanggal</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Kategori</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Jenis</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Berat</th>
                <th style={{ padding: '14px 18px', fontWeight: 700 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboardFilteredDeposits.slice(0, 5).map((d, i) => (
                <tr key={d.id} style={{ borderBottom: '1px solid rgba(203, 213, 225, 0.4)', background: i % 2 === 0 ? 'white' : '#FAFCFD' }}>
                  <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: 'var(--ds-text)' }}>{d.date}</td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ background: d.category === 'Organik' ? 'rgba(16, 185, 129, 0.08)' : d.category === 'Anorganik' ? 'rgba(8, 145, 178, 0.08)' : 'rgba(245, 158, 11, 0.08)', color: d.category === 'Organik' ? '#047857' : d.category === 'Anorganik' ? '#0891B2' : '#b45309', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700 }}>
                      {d.category}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: 'var(--ds-text)' }}>{d.jenis}</td>
                  <td style={{ padding: '14px 18px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--ds-text)' }}>{formatWeight(Number(d.weight) || 0)}</td>
                  <td style={{ padding: '14px 18px' }}><StatusBadge status={d.status} /></td>
                </tr>
              ))}
              {dashboardFilteredDeposits.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '24px 18px', textAlign: 'center', color: 'var(--ds-text-muted)', fontSize: '0.88rem' }}>Tidak ada transaksi pada periode ini.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderInput = () => (
    <div style={{ maxWidth: 700, margin: '0 auto', background: 'white', borderRadius: '1.5rem', padding: '36px 32px', boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ds-text)', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--ds-border)', letterSpacing: '-0.5px' }}>Input Data Sampah Baru</h3>
      
      <form onSubmit={handleInputSubmit} style={{ display: 'grid', gap: 20 }}>
        <div className="form-grid-2" style={{ gap: 20 }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ds-text)', fontSize: '0.85rem', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}><Calendar size={16} /> Tanggal</label>
            <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--ds-border)', borderRadius: 10, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', background: '#F8FAFC', color: 'var(--ds-text)', fontFamily: 'inherit' }} />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ds-text)', fontSize: '0.85rem', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}><Clock size={16} /> Waktu</label>
            <input type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} required style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--ds-border)', borderRadius: 10, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', background: '#F8FAFC', color: 'var(--ds-text)', fontFamily: 'inherit' }} />
          </div>
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ds-text)', fontSize: '0.85rem', fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}><Package size={16} /> Kategori Sampah</label>
          <div className="form-grid-3" style={{ gap: 12 }}>
            {KATEGORI_SAMPAH.map(k => {
              const isSelected = formData.kategori === k;
              return (
                <button key={k} type="button" 
                  onClick={() => setFormData({ ...formData, kategori: k, jenis: '' })}
                  style={{ 
                    padding: '14px', 
                    border: `1.5px solid ${isSelected ? 'var(--ds-accent)' : 'var(--ds-border)'}`, 
                    background: isSelected ? 'rgba(8, 145, 178, 0.05)' : 'white', 
                    borderRadius: 12, 
                    cursor: 'pointer', 
                    fontWeight: 700, 
                    color: isSelected ? 'var(--ds-accent)' : 'var(--ds-text-muted)',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s'
                  }}>
                  {k}
                </button>
              );
            })}
          </div>
        </div>

        <div className="form-grid-2" style={{ gap: 20 }}>
          <div>
            <label style={{ display: 'block', color: 'var(--ds-text)', fontSize: '0.85rem', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Jenis Sampah</label>
            <select value={formData.jenis} onChange={e => setFormData({ ...formData, jenis: e.target.value })} required 
              style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--ds-border)', borderRadius: 10, fontSize: '0.9rem', outline: 'none', background: '#F8FAFC', boxSizing: 'border-box', color: 'var(--ds-text)', fontFamily: 'inherit', cursor: 'pointer' }}>
              <option value="">-- Pilih Jenis ({formData.kategori}) --</option>
              {opsiJenisLokal.map(j => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ds-text)', fontSize: '0.85rem', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}><MapPin size={16} /> Pengelola</label>
            <select value={formData.pengelola} onChange={e => setFormData({ ...formData, pengelola: e.target.value })} required
              style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--ds-border)', borderRadius: 10, fontSize: '0.9rem', outline: 'none', background: '#F8FAFC', boxSizing: 'border-box', color: 'var(--ds-text)', fontFamily: 'inherit', cursor: 'pointer' }}>
              <option value="">-- Pilih Pengelola --</option>
              {opsiPengelolaLokal.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ds-text)', fontSize: '0.85rem', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}><Scale size={16} /> Berat (Kg)</label>
          <input type="number" step="0.1" value={formData.berat} onChange={e => setFormData({ ...formData, berat: e.target.value })} placeholder="Masukkan berat sampah dalam Kg" required style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--ds-border)', borderRadius: 10, fontSize: '1rem', outline: 'none', boxSizing: 'border-box', color: 'var(--ds-text)', fontFamily: 'inherit', background: '#F8FAFC' }} />
        </div>

        <div style={{ background: '#F1F5F9', padding: 18, borderRadius: 12, display: 'flex', gap: 12, alignItems: 'flex-start', marginTop: 8 }}>
          <Info size={20} color="var(--ds-text-muted)" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ds-text-muted)', lineHeight: 1.5, fontWeight: 500 }}>Data yang diinput akan masuk ke sistem pencatatan Timbulan Sampah dan divalidasi oleh Administrator. Pastikan kategori dan jenis sampah sudah sesuai.</p>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button type="submit" style={{ flex: 1, padding: '14px', background: 'var(--ds-text)', color: 'white', border: 'none', borderRadius: '9999px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
            onMouseEnter={e => e.target.style.background = 'var(--ds-accent)'}
            onMouseLeave={e => e.target.style.background = 'var(--ds-text)'}
          >Simpan Data</button>
          <button type="button" onClick={() => setFormData({ ...formData, berat: '', jenis: '', pengelola: '' })} style={{ padding: '14px 28px', background: 'white', color: 'var(--ds-text-muted)', border: '1.5px solid var(--ds-border)', borderRadius: '9999px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.target.style.borderColor = 'var(--ds-text)'; e.target.style.color = 'var(--ds-text)'; }}
            onMouseLeave={e => { e.target.style.borderColor = 'var(--ds-border)'; e.target.style.color = 'var(--ds-text-muted)'; }}
          >Reset</button>
        </div>
      </form>
    </div>
  );

  const renderRiwayat = () => (
    <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)', margin: 0, letterSpacing: '-0.3px' }}>Riwayat Input Saya</h3>
        
        <select value={riwayatFilter} onChange={e => setRiwayatFilter(e.target.value)}
          style={{ padding: '6px 12px', border: '1.5px solid var(--ds-border)', borderRadius: 10, fontSize: '0.82rem', outline: 'none', background: '#F8FAFC', color: 'var(--ds-text)', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>
          <option value="semua">Semua Periode</option>
          <option value="hari">Hari Ini</option>
          <option value="minggu">Minggu Ini</option>
          <option value="bulan">Bulan Ini</option>
        </select>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--ds-border)', color: 'var(--ds-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Waktu</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Kategori</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Jenis</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Pengelola</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Berat</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Status</th>
              <th style={{ padding: '14px 18px', fontWeight: 700, textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {riwayatFilteredDeposits.map((d, i) => (
              <tr key={d.id} style={{ borderBottom: '1px solid rgba(203, 213, 225, 0.4)', background: i % 2 === 0 ? 'white' : '#FAFCFD' }}>
                <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: 'var(--ds-text)' }}>{d.date} <span style={{ color: 'var(--ds-text-muted)', fontSize: '0.8rem' }}>{d.time}</span></td>
                <td style={{ padding: '14px 18px' }}>
                  <span style={{ background: d.category === 'Organik' ? 'rgba(16, 185, 129, 0.08)' : d.category === 'Anorganik' ? 'rgba(8, 145, 178, 0.08)' : 'rgba(245, 158, 11, 0.08)', color: d.category === 'Organik' ? '#047857' : d.category === 'Anorganik' ? '#0891B2' : '#b45309', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700 }}>
                    {d.category}
                  </span>
                </td>
                <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: 'var(--ds-text)' }}>{d.jenis}</td>
                <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: 'var(--ds-text)' }}>{d.pengelola}</td>
                <td style={{ padding: '14px 18px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--ds-text)' }}>{formatWeight(Number(d.weight) || 0)}</td>
                <td style={{ padding: '14px 18px' }}><StatusBadge status={d.status} /></td>
                <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                  {(d.status === 'Pending' || d.status === 'Menunggu Validasi') && (
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button onClick={() => setGeneratedQr(d.id)} style={{ background: '#E0F2FE', color: '#0284C7', border: 'none', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, transition: 'all 0.2s' }}
                        onMouseEnter={e => e.target.style.background = '#BAE6FD'}
                        onMouseLeave={e => e.target.style.background = '#E0F2FE'}
                      >
                        Lihat QR
                      </button>
                      <button onClick={() => {
                        if(window.confirm('Hapus data transaksi ini?')) {
                          onDeleteDeposit(d.id, d.status);
                        }
                      }} style={{ background: '#FEE2E2', color: '#EF4444', border: 'none', padding: 8, borderRadius: 8, cursor: 'pointer', display: 'inline-flex', transition: 'all 0.2s' }}
                        onMouseEnter={e => e.target.style.background = '#FCA5A5'}
                        onMouseLeave={e => e.target.style.background = '#FEE2E2'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {riwayatFilteredDeposits.length === 0 && (
              <tr>
                <td colSpan="7" style={{ padding: '24px 18px', textAlign: 'center', color: 'var(--ds-text-muted)', fontSize: '0.88rem' }}>Tidak ada riwayat transaksi pada periode ini.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderNeraca = () => (
    <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)', margin: 0, letterSpacing: '-0.3px' }}>
            Neraca Sampah - Unit {userUnit === 'Wonogiri' ? 'PLTA Wonogiri' : (userUnit === 'Banjarnegara' ? 'PLTA PB.Soedirman' : userUnit || 'Semua Unit')}
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--ds-text-muted)' }}>
            Menampilkan data timbulan dan pemanfaatan sampah sesuai periode
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ds-text-muted)' }}>Periode:</label>
          <select value={selectedBulan} onChange={e => setSelectedBulan(e.target.value)}
            style={{ padding: '9px 14px', border: '1.5px solid var(--ds-border)', borderRadius: 10, fontSize: '0.88rem', outline: 'none', background: 'white', color: 'var(--ds-text)', fontFamily: 'inherit', cursor: 'pointer' }}>
            <option value="2026-06">Juni 2026</option>
            <option value="2026-07">Juli 2026</option>
          </select>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--ds-border)', color: 'var(--ds-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Kategori</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Jenis Sampah</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Timbulan (Kg)</th>
              <th style={{ padding: '14px 18px', fontWeight: 700 }}>Yang Dimanfaatkan (Kg)</th>
            </tr>
          </thead>
          <tbody>
            {filteredNeraca.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '24px 18px', textAlign: 'center', color: 'var(--ds-text-muted)', fontSize: '0.9rem' }}>
                  Tidak ada data neraca sampah untuk unit dan periode ini.
                </td>
              </tr>
            ) : (
              filteredNeraca.map((n, i) => (
                <tr key={n.id} style={{ borderBottom: '1px solid rgba(203, 213, 225, 0.4)', background: i % 2 === 0 ? 'white' : '#FAFCFD' }}>
                  <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: 'var(--ds-text)' }}>{n.category}</td>
                  <td style={{ padding: '14px 18px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--ds-text)' }}>{n.jenis}</td>
                  <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: 'var(--ds-text)' }}>{Number(n.timbulan).toFixed(1)}</td>
                  <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: '#047857', fontWeight: 600 }}>{Number(n.dimanfaatkan).toFixed(1)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

const renderBuktiBayar = () => (
  <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
      <div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)', margin: 0, letterSpacing: '-0.3px' }}>Bukti Bayar Tahunan</h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--ds-text-muted)' }}>Klik tombol aksi untuk mengelola kwitansi bulanan</p>
      </div>
      
      <select value={selectedTahun} onChange={e => setSelectedTahun(e.target.value)}
        style={{ padding: '9px 14px', border: '1.5px solid var(--ds-border)', borderRadius: 10, fontSize: '0.88rem', outline: 'none', background: 'white', color: 'var(--ds-text)', fontFamily: 'inherit', cursor: 'pointer' }}>
        <option value="2026">Tahun 2026</option>
        <option value="2025">Tahun 2025</option>
      </select>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 14 }}>
      {DAFTAR_BULAN.map(bulan => {
        const targetKey = `${selectedTahun}-${bulan.id}`;
        const b = unitBuktiBayar.find(item => item.month === targetKey);
        const isEditable = b && b.status !== 'Lunas';

        return (
          <div key={bulan.id} style={{ border: '1px solid var(--ds-border)', borderRadius: 12, padding: '14px', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.01)', display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--ds-text)', display: 'block', marginBottom: 4 }}>{bulan.nama}</span>
              {b ? <StatusBadge status={b.status} /> : <span style={{ fontSize: '0.72rem', color: 'var(--ds-text-muted)', fontWeight: 500 }}>Belum Ada Data</span>}
            </div>
            
            <div style={{ marginTop: 4, display: 'flex', gap: 6 }}>
              {b && b.img_url ? (
                <>
                  <button onClick={() => setActiveKwitansiPopup(b)} 
                    style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#E0F2FE', color: '#0284C7', border: 'none', padding: '8px', borderRadius: 8, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                  > 
                    <Eye size={12} /> Lihat
                  </button>

                  {isEditable && (
                    <button onClick={() => setDeleteTarget(b.id)} 
                      style={{ background: '#FEE2E2', color: '#EF4444', border: 'none', padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </>
              ) : (
                <label style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#F1F5F9', color: 'var(--ds-text)', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, border: '1px solid var(--ds-border)' }}>
                  <Upload size={12} /> Upload
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleUploadKwitansiPerBulan(e, bulan.id)} />
                </label>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

  const renderInputProgram = () => {
    if (selectedProgramData) {
      return (
        <div style={{ maxWidth: 700, margin: '0 auto', background: 'white', borderRadius: '1.5rem', padding: '36px 32px', boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
          <button onClick={() => { setSelectedProgramData(null); setProgramFormValues({}); }} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', color: 'var(--ds-text-muted)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, marginBottom: 24, padding: 0 }}>
            <ArrowLeft size={16} /> Kembali ke Daftar Program
          </button>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--ds-border)' }}>
            <div style={{ background: 'var(--ds-accent)', color: 'white', padding: 12, borderRadius: 12 }}>
              <FolderKanban size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ds-text)', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>{selectedProgramData.nama}</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ds-text-muted)', lineHeight: 1.5 }}>{selectedProgramData.deskripsi}</p>
            </div>
          </div>
          
          <form onSubmit={async (e) => {
            e.preventDefault();
            try {
              const res = await fetch('/api/input-program', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  user: username,
                  unit: userUnit,
                  program_name: selectedProgramData.nama,
                  date: formData.date,
                  time: formData.time,
                  kategori_sampah: programKategori,
                  jenis_sampah: programJenis,
                  form_data: programFormValues
                })
              });
              const result = await res.json();
              if (result.success) {
                alert('Data program berhasil disimpan!');
                setSelectedProgramData(null);
                setProgramFormValues({});
              } else {
                alert('Gagal menyimpan data: ' + result.error);
              }
            } catch (err) {
              console.error(err);
              alert('Terjadi kesalahan sistem.');
            }
          }} style={{ display: 'grid', gap: 20 }}>
            
            <div className="form-grid-2" style={{ gap: 20 }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ds-text)', fontSize: '0.85rem', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}><Calendar size={16} /> Tanggal</label>
                <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--ds-border)', borderRadius: 10, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', background: '#F8FAFC', color: 'var(--ds-text)', fontFamily: 'inherit' }} />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ds-text)', fontSize: '0.85rem', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}><Clock size={16} /> Waktu</label>
                <input type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} required style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--ds-border)', borderRadius: 10, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', background: '#F8FAFC', color: 'var(--ds-text)', fontFamily: 'inherit' }} />
              </div>
            </div>

            <div className="form-grid-2" style={{ gap: 20 }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ds-text)', fontSize: '0.85rem', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}><Package size={16} /> Kategori Sampah</label>
                <select value={programKategori} onChange={e => { setProgramKategori(e.target.value); setProgramJenis(''); }} required style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--ds-border)', borderRadius: 10, fontSize: '0.9rem', outline: 'none', background: '#F8FAFC', color: 'var(--ds-text)', fontFamily: 'inherit', cursor: 'pointer' }}>
                  <option value="">-- Pilih Kategori --</option>
                  {KATEGORI_SAMPAH.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ds-text)', fontSize: '0.85rem', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}><Package size={16} /> Jenis Sampah</label>
                <select value={programJenis} onChange={e => setProgramJenis(e.target.value)} required style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--ds-border)', borderRadius: 10, fontSize: '0.9rem', outline: 'none', background: '#F8FAFC', color: 'var(--ds-text)', fontFamily: 'inherit', cursor: 'pointer' }} disabled={!programKategori}>
                  <option value="">-- Pilih Jenis --</option>
                  {programOpsiJenisLokal.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
            </div>

            {selectedProgramData.fields.map(field => {
              const hasKg = /kg/i.test(field.label);
              const displayLabel = hasKg ? field.label : `${field.label} (Kg)`;
              const placeholder = hasKg ? `Masukkan ${field.label.toLowerCase()}` : `Masukkan ${field.label.toLowerCase()} dalam satuan Kg`;
              return (
              <div key={field.id}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ds-text)', fontSize: '0.85rem', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}><CheckCircle2 size={16} /> {displayLabel}</label>
                <input type={field.type} step="0.1" value={programFormValues[field.id] || ''} onChange={e => setProgramFormValues({ ...programFormValues, [field.id]: e.target.value })} placeholder={placeholder} required style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--ds-border)', borderRadius: 10, fontSize: '1rem', outline: 'none', boxSizing: 'border-box', color: 'var(--ds-text)', fontFamily: 'inherit', background: '#F8FAFC' }} />
              </div>
              );
            })}
            
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button type="submit" style={{ flex: 1, padding: '14px', background: 'var(--ds-text)', color: 'white', border: 'none', borderRadius: '9999px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                onMouseEnter={e => e.target.style.background = 'var(--ds-accent)'}
                onMouseLeave={e => e.target.style.background = 'var(--ds-text)'}>
                Simpan Data
              </button>
            </div>
          </form>
        </div>
      );
    }

    return (
      <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ds-text)', marginBottom: 8, letterSpacing: '-0.5px' }}>Pilih Program Pemanfaatan</h3>
        <p style={{ color: 'var(--ds-text-muted)', fontSize: '0.9rem', marginBottom: 24 }}>Pilih salah satu program dari daftar di bawah ini untuk mulai mengisi data nilai pemanfaatan.</p>
        
        {loadingPrograms ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--ds-text-muted)' }}>Memuat daftar program...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {programsData.map(prog => (
              <div key={prog.id} onClick={() => setSelectedProgramData(prog)}
                style={{
                  border: '1px solid var(--ds-border)', borderRadius: 16, padding: 20,
                  cursor: 'pointer', transition: 'all 0.2s', background: '#FAFCFD',
                  display: 'flex', flexDirection: 'column', gap: 12
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ds-accent)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(8, 145, 178, 0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--ds-border)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ background: 'rgba(8, 145, 178, 0.1)', width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ds-accent)' }}>
                  <FolderKanban size={24} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)' }}>{prog.nama}</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--ds-text-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{prog.deskripsi || 'Tidak ada deskripsi'}</p>
                </div>
                <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px dashed rgba(203, 213, 225, 0.6)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ds-accent)' }}>Pilih Program →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

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

      <div className={`sidebar-container ${!sidebarOpen ? 'closed' : ''} ${sidebarOpen ? 'open' : ''}`} style={{
        width: 260, background: 'var(--ds-dark)', color: 'white', display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, bottom: 0, zIndex: 50,
        boxShadow: '4px 0 30px rgba(0,0,0,0.15)'
      }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ background: 'white', padding: 6, borderRadius: 8, display: 'flex' }}><PLNLogo size={42} unit={userUnit} /></div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, lineHeight: 1.2, letterSpacing: '-0.5px' }}>Powercycle</h1>
            <p style={{ fontSize: '0.72rem', color: 'var(--ds-accent-light)', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>User Portal • {userUnit === 'Wonogiri' ? 'PLTA Wonogiri' : (userUnit === 'Banjarnegara' ? 'PLTA PB.Soedirman' : userUnit || 'Pusat')}</p>
          </div>
        </div>

        <div style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
          {navItems.map(item => {
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

      <div className={`main-content ${!sidebarOpen ? 'sidebar-closed' : ''}`} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh', transition: 'margin 0.3s ease' }}>
        <header style={{ background: 'white', padding: '16px 28px', borderBottom: '1px solid var(--ds-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ds-text)' }}>
              <Menu size={24} />
            </button>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--ds-text)', letterSpacing: '-0.5px' }}>{navItems.find(n => n.id === currentPage)?.label}</h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--ds-text-muted)', fontWeight: 500 }}>Hari ini: {new Date(TODAY).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: 'var(--ds-text)', color: 'white', padding: '8px 18px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {username || 'Nasabah'}
            </div>
            
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
          {currentPage === 'input' && renderInput()}
          {currentPage === 'input-program' && renderInputProgram()}
          {currentPage === 'riwayat' && renderRiwayat()}
          {currentPage === 'neraca' && renderNeraca()}
          {currentPage === 'bukti-bayar' && renderBuktiBayar()}
          {currentPage === 'ringkasan' && (
            <div style={{ background: 'white', borderRadius: '1.5rem', padding: 40, textAlign: 'center', border: '1px solid var(--ds-border)', boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)' }}>
              <BarChart2 size={48} color="var(--ds-accent)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ margin: '0 0 8px 0', color: 'var(--ds-text)', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.3px' }}>Ringkasan Data</h3>
              <p style={{ color: 'var(--ds-text-muted)', margin: 0, fontWeight: 500 }}>Total berat: <strong>{formatWeight(totalWeight)} Kg</strong> dari {myDeposits.length} transaksi.</p>
            </div>
          )}
        </main>
      </div>

      {/* Pop-up Detail Kwitansi User */}
{activeKwitansiPopup && (
  <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(12, 26, 46, 0.6)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease-out' }}>
    <div style={{ background: 'white', width: '100%', maxWidth: 440, borderRadius: '1.5rem', padding: 32, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Detail Dokumentasi Kwitansi</h3>
        <button onClick={() => setActiveKwitansiPopup(null)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>&times;</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        <div style={{ fontSize: '0.85rem' }}>No. Bukti: <strong>{activeKwitansiPopup.no_bukti}</strong></div>
        
        {/* Kontainer Gambar dengan tombol Fullscreen & Download */}
        <div style={{ position: 'relative', width: '100%', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0', background: '#F8FAFC' }}>
          <img 
            src={activeKwitansiPopup.img_url} 
            alt="Kwitansi" 
            style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 350, objectFit: 'contain', cursor: 'pointer' }}
            onClick={() => setFullImage(activeKwitansiPopup.img_url)}
          />
          
          <div style={{ position: 'absolute', bottom: 10, right: 10, display: 'flex', gap: 8 }}>
            <button onClick={() => setFullImage(activeKwitansiPopup.img_url)} style={{ padding: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
              <Maximize2 size={18} />
            </button>
            <a href={activeKwitansiPopup.img_url} download={`Bukti_${activeKwitansiPopup.no_bukti}.png`} style={{ padding: '8px', background: '#0891B2', color: 'white', borderRadius: 8 }}>
              <Download size={18} />
            </a>
          </div>
        </div>
      </div>

      <button onClick={() => setActiveKwitansiPopup(null)} style={{ width: '100%', padding: '12px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '9999px', fontWeight: 700, cursor: 'pointer' }}>
        Tutup Kembali
      </button>
    </div>
  </div>
)}

{/* Lightbox Fullscreen */}
{fullImage && (
  <div onClick={() => setFullImage(null)} style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <img src={fullImage} style={{ maxWidth: '95%', maxHeight: '95%', objectFit: 'contain' }} />
    <button onClick={() => setFullImage(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'white', border: 'none', padding: 10, borderRadius: '50%', cursor: 'pointer' }}>
      <X size={24} />
    </button>
  </div>
)}

      {deleteTarget && (
  <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(12, 26, 46, 0.6)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s' }}>
    <div style={{ background: 'white', width: '100%', maxWidth: 360, borderRadius: '1.5rem', padding: 32, textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
      <div style={{ width: 64, height: 64, background: '#FEE2E2', color: '#EF4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <Trash2 size={32} />
      </div>
      <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: 'var(--ds-text)' }}>Hapus Bukti Pembayaran?</h3>
      <p style={{ color: 'var(--ds-text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>Data ini akan dihapus permanen dari sistem.</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => setDeleteTarget(null)} style={{ flex: 1, padding: '12px', background: '#F1F5F9', border: 'none', borderRadius: 99, fontWeight: 700, cursor: 'pointer' }}>Batal</button>
        <button onClick={() => { onDeleteBuktiBayar(deleteTarget); setDeleteTarget(null); }} style={{ flex: 1, padding: '12px', background: '#EF4444', color: 'white', border: 'none', borderRadius: 99, fontWeight: 700, cursor: 'pointer' }}>Hapus</button>
      </div>
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

      {showConfirmPopup && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(12, 26, 46, 0.6)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: 420, borderRadius: '1.5rem', padding: 32, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Package size={32} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--ds-text)', letterSpacing: '-0.5px' }}>Konfirmasi Data</h3>
              <p style={{ margin: '8px 0 0', color: 'var(--ds-text-muted)', fontSize: '0.9rem' }}>Pastikan rincian data sampah sudah benar.</p>
            </div>
            
            <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24, border: '1px solid var(--ds-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--ds-text-muted)', fontWeight: 500 }}>Total Timbulan</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--ds-accent)' }}>{formatWeight(formData.berat)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--ds-text-muted)', fontWeight: 500 }}>Pengelola</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ds-text)', textAlign: 'right', maxWidth: 160, lineHeight: 1.2 }}>{formData.pengelola}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--ds-text-muted)', fontWeight: 500 }}>Kategori / Jenis</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ds-text)' }}>{formData.kategori} - {formData.jenis}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--ds-text-muted)', fontWeight: 500 }}>Tanggal Setor</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ds-text)' }}>{formData.date} {formData.time}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowConfirmPopup(false)} style={{ flex: 1, padding: '14px', background: 'white', color: 'var(--ds-text)', border: '1.5px solid var(--ds-border)', borderRadius: '9999px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.target.style.background = '#F1F5F9'; }}
                onMouseLeave={e => { e.target.style.background = 'white'; }}
              >Batal</button>
              <button onClick={handleConfirmSave} style={{ flex: 1, padding: '14px', background: 'var(--ds-accent)', color: 'white', border: 'none', borderRadius: '9999px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                onMouseEnter={e => e.target.style.background = 'var(--ds-accent-light)'}
                onMouseLeave={e => e.target.style.background = 'var(--ds-accent)'}
              >Lanjutkan</button>
            </div>
          </div>
        </div>
      )}

      {generatedQr && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(12, 26, 46, 0.6)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: 360, borderRadius: '1.5rem', padding: 32, boxShadow: '0 20px 40px rgba(0,0,0,0.1)', animation: 'scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.25rem', fontWeight: 800, color: 'var(--ds-text)', letterSpacing: '-0.5px' }}>Tunjukkan QR Code</h3>
            <p style={{ margin: '0 0 24px', color: 'var(--ds-text-muted)', fontSize: '0.9rem' }}>Silakan tunjukkan QR Code ini kepada Petugas Verifikasi untuk divalidasi.</p>
            
            <div style={{ background: 'white', padding: 16, border: '1px solid var(--ds-border)', borderRadius: 16, display: 'inline-block', marginBottom: 24, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
              <QRCodeSVG id="qr-code-svg" value={`${window.location.origin}/validator/verify/${generatedQr}`} size={200} />
            </div>
            
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <button onClick={handleDownloadQR} style={{ flex: 1, padding: '12px', background: 'white', color: 'var(--ds-text)', border: '1.5px solid var(--ds-border)', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                <Download size={18} /> Download
              </button>
              <button onClick={handleShareQR} style={{ flex: 1, padding: '12px', background: 'white', color: 'var(--ds-text)', border: '1.5px solid var(--ds-border)', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                <Share2 size={18} /> Share
              </button>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => { setGeneratedQr(null); setCurrentPage('riwayat'); }} style={{ flex: 1, padding: '14px', background: 'var(--ds-accent)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                onMouseEnter={e => e.target.style.background = 'var(--ds-accent-light)'}
                onMouseLeave={e => e.target.style.background = 'var(--ds-accent)'}
              >Selesai</button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .sidebar-container { left: 0; }
        .main-content { margin-left: 260px; }
        .sidebar-overlay { display: none !important; }
        
        @media (max-width: 1024px) {
          .sidebar-container { left: ${sidebarOpen ? '0' : '-260px'} !important; }
          .main-content { margin-left: 0 !important; }
          .sidebar-toggle { display: block !important; }
          .sidebar-overlay { display: block !important; }
        }
      `}} />
    </div>
  );
}
