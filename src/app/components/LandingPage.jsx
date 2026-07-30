'use client';
import './LandingPage.css';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Recycle, Leaf, Factory, TrendingUp, ArrowRight, BarChart3,
  Users, Scale, ChevronDown, Menu, X, MapPin, Phone, Mail, ArrowUp, Navigation, ExternalLink
} from 'lucide-react';
import {
  BarChart, Bar, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  UNIT_LIST, formatWeight, formatWeightTon
} from '../lib/mockData';

function useCountUp(target, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) {
      setCount(0);
      return;
    }
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.round(start * 10) / 10);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

const PLNLogo = ({ size = 64, unit = '' }) => {
  let customLogoUrl = '/Logo.png';
  if (unit === 'Wonogiri') customLogoUrl = '/Logo PLTA WONOGIRI.png';
  else if (unit === 'Banjarnegara') customLogoUrl = '/Logo PLTA PB. Soedirman.png';
  
  if (customLogoUrl) {
    return <img src={customLogoUrl} alt="Logo" style={{ height: size, maxWidth: '100%', objectFit: 'contain' }} />;
  }
  return null;
};

export default function LandingPage({ initialDeposits = [], mockUsers = [], pemanfaatanData = [] }) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeUnit, setActiveUnit] = useState('all');
  const [showTopBtn, setShowTopBtn] = useState(false);

  // State untuk Data Unit & Peta dari Database
  const [dbUnits, setDbUnits] = useState([]);
  const [activeMapLoc, setActiveMapLoc] = useState(null);
  const [loadingMapUnits, setLoadingMapUnits] = useState(true);

  // Fetch daftar unit dari database saat komponen dimuat
  useEffect(() => {
    const fetchMapUnits = async () => {
      setLoadingMapUnits(true);
      try {
        const res = await fetch('/api/master/unit');
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setDbUnits(json.data);
          setActiveMapLoc(json.data[0]); // Default unit pertama
        }
      } catch (err) {
        console.error("Gagal mengambil data unit peta:", err);
      } finally {
        setLoadingMapUnits(false);
      }
    };

    fetchMapUnits();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
      setShowTopBtn(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter data transaksi berdasarkan Unit yang aktif
  const currentFilteredDeposits = useMemo(() => {
    return activeUnit === 'all'
      ? initialDeposits
      : initialDeposits.filter(d => d.unit === activeUnit);
  }, [activeUnit, initialDeposits]);

  const monthlyChartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = months.map(m => ({ bulan: m, berat: 0 }));

    currentFilteredDeposits.forEach(d => {
      const date = new Date(d.date);
      if (date.getFullYear() === new Date().getFullYear()) {
        const monthIndex = date.getMonth();
        if (data[monthIndex]) {
          data[monthIndex].berat += Number(d.weight) || 0;
        }
      }
    });
    return data;
  }, [currentFilteredDeposits]);

  const stats = useMemo(() => {
    const totalWeight = currentFilteredDeposits.reduce((s, d) => s + (Number(d.weight) || 0), 0);
    const organikWeight = currentFilteredDeposits.filter(d => d.category === 'Organik').reduce((s, d) => s + (Number(d.weight) || 0), 0);
    const anorganikWeight = currentFilteredDeposits.filter(d => d.category === 'Anorganik').reduce((s, d) => s + (Number(d.weight) || 0), 0);
    const residuWeight = currentFilteredDeposits.filter(d => d.category === 'Residu').reduce((s, d) => s + (Number(d.weight) || 0), 0);
    const totalTransactions = currentFilteredDeposits.length;
    const totalUsers = activeUnit === 'all'
      ? mockUsers.filter(u => u.role === 'User').length
      : mockUsers.filter(u => u.role === 'User' && u.unit === activeUnit).length;

    return { totalWeight, organikWeight, anorganikWeight, residuWeight, totalTransactions, totalUsers };
  }, [activeUnit, currentFilteredDeposits, mockUsers]);

  // Statistik per Unit untuk Panel Peta
  const unitStatsMap = useMemo(() => {
    const statsMap = {};
    initialDeposits.forEach(d => {
      const unitKey = d.unit || 'Lainnya';
      if (!statsMap[unitKey]) {
        statsMap[unitKey] = { totalWeight: 0, nasabahCount: 0 };
      }
      statsMap[unitKey].totalWeight += (Number(d.weight) || 0);
    });

    mockUsers.forEach(u => {
      if (u.role === 'User' && u.unit) {
        if (!statsMap[u.unit]) {
          statsMap[u.unit] = { totalWeight: 0, nasabahCount: 0 };
        }
        statsMap[u.unit].nasabahCount += 1;
      }
    });

    return statsMap;
  }, [initialDeposits, mockUsers]);

  const pieData = [
    { name: 'Organik', value: +Number(stats.organikWeight).toFixed(1), color: '#10B981' },
    { name: 'Anorganik', value: +Number(stats.anorganikWeight).toFixed(1), color: '#0891B2' },
    { name: 'Residu', value: +Number(stats.residuWeight).toFixed(1), color: '#F59E0B' },
  ];

  const animatedTotal = useCountUp(stats.totalWeight, 1500);
  const animatedTransactions = useCountUp(stats.totalTransactions, 1200);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper pembuat URL Google Maps Embed (Mendukung PARSING LINK LENGKAP)
  const getMapEmbedUrl = (loc) => {
    if (!loc) return 'https://maps.google.com/maps?q=PT.+PLN+Indonesia+Power+UBP+Mrica&z=17&output=embed';

    // 1. Jika map_url tersedia di database
    if (loc.map_url && loc.map_url.trim() !== '') {
      const rawUrl = loc.map_url.trim();

      // Ekstrak nama lokasi dari URL /place/
      if (rawUrl.includes('/place/')) {
        const matchPlace = rawUrl.match(/\/place\/([^/]+)/);
        if (matchPlace && matchPlace[1]) {
          const placeName = decodeURIComponent(matchPlace[1].replace(/\+/g, ' '));
          return `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&z=17&output=embed`;
        }
      }

      // Ekstrak dari URL koordinat /@latitude,longitude
      if (rawUrl.includes('/@')) {
        const matchCoords = rawUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (matchCoords && matchCoords[1] && matchCoords[2]) {
          return `https://maps.google.com/maps?q=${matchCoords[1]},${matchCoords[2]}&z=17&output=embed`;
        }
      }

      // Jika URL sudah mengandung output=embed
      if (rawUrl.includes('output=embed')) {
        return rawUrl;
      }

      return `https://maps.google.com/maps?q=${encodeURIComponent(rawUrl)}&z=17&output=embed`;
    }

    // 2. Fallback berdasarkan nama unit jika map_url di DB masih kosong
    const name = (loc.nama_unit || '').toLowerCase();
    if (name.includes('mrica') || name.includes('banjarnegara')) {
      return 'https://maps.google.com/maps?q=PT.+PLN+Indonesia+Power+UBP+Mrica&z=17&output=embed';
    }
    if (name.includes('wonogiri')) {
      return 'https://maps.google.com/maps?q=PLTA+Wonogiri&z=17&output=embed';
    }
    if (name.includes('jakarta')) {
      return 'https://maps.google.com/maps?q=Jakarta+Indonesia&z=12&output=embed';
    }

    return `https://maps.google.com/maps?q=${encodeURIComponent(loc.nama_unit)}&z=15&output=embed`;
  };

  // Helper pembuat Link Google Maps eksternal
  const getExternalMapUrl = (loc) => {
    if (!loc) return 'https://www.google.com/maps/place/PT.+PLN+Indonesia+Power+UBP+Mrica/';

    if (loc.map_url && loc.map_url.trim() !== '') {
      return loc.map_url.trim();
    }

    const name = (loc.nama_unit || '').toLowerCase();
    if (name.includes('mrica') || name.includes('banjarnegara')) {
      return 'https://www.google.com/maps/place/PT.+PLN+Indonesia+Power+UBP+Mrica/';
    }

    return `https://www.google.com/maps/search/${encodeURIComponent(loc.nama_unit)}`;
  };

  return (
    <div className="landing-root">
      <header className={`landing-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-inner">
          <a href="#hero" className="header-brand">
            <span className="header-logo-wrap">
              <PLNLogo size={42} unit={activeUnit} />
            </span>
            <span className="header-brand-text">
              <span className="brand-name">Powercycle</span>
              <span className="brand-tagline">Bank Sampah Digital</span>
            </span>
          </a>

          <nav className="header-nav-desktop">
            <a href="#hero" className="nav-link active">Beranda</a>
            <a href="#tentang" className="nav-link">Tentang</a>
            <a href="#statistik" className="nav-link">Statistik</a>
            <a href="#peta" className="nav-link">Unit</a>
            <a href="#kontak" className="nav-link">Kontak</a>
          </nav>

          <div className="header-actions">
            <a href="/login" className="btn-login">
              Masuk <ArrowRight size={16} />
            </a>
            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="mobile-menu">
          <a href="#hero" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Beranda</a>
          <a href="#tentang" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Tentang</a>
          <a href="#statistik" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Statistik</a>
          <a href="#peta" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Unit</a>
          <a href="#kontak" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Kontak</a>
          <a href="/login" className="btn-login mobile">
            Masuk <ArrowRight size={16} />
          </a>
        </div>
      )}

      <section id="hero" className="hero-section">
        <div className="hero-bg-effects" aria-hidden="true">
          <div className="hero-glow hero-glow-1" />
          <div className="hero-glow hero-glow-2" />
          <div className="hero-glow hero-glow-3" />
        </div>

        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-badge animate-fade-up">
              <Recycle size={14} />
              <span>Bank Sampah Digital PLTA</span>
            </div>

            <h1 className="hero-title animate-fade-up delay-1">
              Pilah Sampah, Selamatkan Bumi{' '}
              <span className="hero-title-accent">Kurangi, Gunakan Lagi, Daur Ulang.</span>
            </h1>

            <p className="hero-description animate-fade-up delay-2">
              PT PLN Indonesia Power UBP Mrica berupaya melakukan pengelolaan sampah yang
              berkelanjutan, terukur dan terintegrasi untuk mendukung peningkatan target
              pengelolaan sampah yang optimal.
            </p>

            <div className="hero-cta animate-fade-up delay-3">
              <a href="#tentang" className="btn-secondary-hero">
                Tentang Kami
              </a>
              <a href="#statistik" className="btn-primary-hero">
                Lihat Statistik <ArrowRight size={16} />
              </a>
            </div>
          </div>

          <div className="hero-right animate-fade-up delay-3">
            <div className="hero-stats-card featured">
              <div className="hero-card-tag">
                <BarChart3 size={14} />
                Ringkasan Data
              </div>
              <h3 className="hero-card-title">Total Pengelolaan Sampah</h3>
              <div className="hero-stats-grid">
                <div className="hero-stat-item">
                  <span className="hero-stat-value">{formatWeightTon(animatedTotal).split(' ')[0]}</span>
                  <span className="hero-stat-label">Ton Terkelola</span>
                </div>
                <div className="hero-stat-item">
                  <span className="hero-stat-value">{Math.round(animatedTransactions)}</span>
                  <span className="hero-stat-label">Transaksi</span>
                </div>
                <div className="hero-stat-item">
                  <span className="hero-stat-value">{dbUnits.length || UNIT_LIST.length}</span>
                  <span className="hero-stat-label">Unit Aktif</span>
                </div>
              </div>
            </div>

            <div className="hero-stats-card">
              <div className="hero-card-tag">
                <Recycle size={14} />
                Komposisi
              </div>
              <div className="hero-stats-grid">
                <div className="hero-stat-item">
                  <span className="hero-stat-value" style={{ color: '#10B981' }}>{Number(stats.organikWeight).toFixed(1)}</span>
                  <span className="hero-stat-label">Kg Organik</span>
                </div>
                <div className="hero-stat-item">
                  <span className="hero-stat-value" style={{ color: '#0891B2' }}>{Number(stats.anorganikWeight).toFixed(1)}</span>
                  <span className="hero-stat-label">Kg Anorganik</span>
                </div>
                <div className="hero-stat-item">
                  <span className="hero-stat-value" style={{ color: '#F59E0B' }}>{Number(stats.residuWeight).toFixed(1)}</span>
                  <span className="hero-stat-label">Kg Residu</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <a href="#tentang" className="scroll-indicator" aria-label="Scroll down">
          <ChevronDown size={20} />
        </a>
      </section>

      <section id="tentang" className="section-tentang">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">
              <span className="badge-line" />Tentang Kami
            </span>
            <h2 className="section-title">
              Apa itu <span className="text-accent">Powercycle?</span>
            </h2>
            <p className="section-subtitle">
              Powercycle adalah sistem bank sampah digital yang dikembangkan untuk mendukung
              pengelolaan sampah di wilayah PLN Indonesia Power UBP Mrica. Platform ini memudahkan pencatatan,
              monitoring, dan pelaporan data sampah dari berbagai unit secara real-time.
            </p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                <Leaf size={28} />
              </div>
              <h3 className="feature-title">Ramah Lingkungan</h3>
              <p className="feature-desc">Mendukung pengelolaan sampah yang berkelanjutan dan terukur untuk mengurangi dampak lingkungan secara signifikan.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ background: 'rgba(8,145,178,0.1)', color: '#0891B2' }}>
                <BarChart3 size={28} />
              </div>
              <h3 className="feature-title">Real-time Monitoring</h3>
              <p className="feature-desc">Pantau data sampah secara real-time dengan visualisasi grafik yang informatif dan mudah dipahami oleh semua pihak.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
                <Factory size={28} />
              </div>
              <h3 className="feature-title">Multi Unit</h3>
              <p className="feature-desc">Mendukung pencatatan dari berbagai unit operasional dengan data yang terpisah namun terintegrasi dalam satu platform.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="statistik" className="section-statistik">
        <div className="section-container">
          <div className="section-header center">
            <span className="section-badge light">
              <span className="badge-line light" />Statistik
            </span>
            <h2 className="section-title light">
              Data Pengelolaan <span className="text-accent">Sampah</span>
            </h2>
            <p className="section-subtitle light">
              Statistik pengumpulan dan pengelolaan sampah dari seluruh unit operasional Bank Sampah Powercycle.
            </p>
          </div>

          <div className="unit-filter">
            <button
              className={`filter-btn ${activeUnit === 'all' ? 'active' : ''}`}
              onClick={() => setActiveUnit('all')}
            >
              Semua Unit
            </button>
            {UNIT_LIST.map(unit => (
              <button
                key={unit}
                className={`filter-btn ${activeUnit === unit ? 'active' : ''}`}
                onClick={() => setActiveUnit(unit)}
              >
                {unit === 'Wonogiri' ? 'PLTA Wonogiri' : (unit === 'Banjarnegara' ? 'PLTA PB.Soedirman' : unit)}
              </button>
            ))}
          </div>

          <div className="stats-grid">
            <div className="stat-card glass">
              <div className="stat-icon-wrap green">
                <Scale size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{formatWeightTon(stats.totalWeight)}</span>
                <span className="stat-label">Total Berat Sampah</span>
              </div>
            </div>
            <div className="stat-card glass">
              <div className="stat-icon-wrap blue">
                <TrendingUp size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.totalTransactions}</span>
                <span className="stat-label">Total Transaksi</span>
              </div>
            </div>
            <div className="stat-card glass">
              <div className="stat-icon-wrap amber">
                <Users size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.totalUsers}</span>
                <span className="stat-label">Nasabah Aktif</span>
              </div>
            </div>
            <div className="stat-card glass">
              <div className="stat-icon-wrap purple">
                <Recycle size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{dbUnits.length || UNIT_LIST.length}</span>
                <span className="stat-label">Unit Operasional</span>
              </div>
            </div>
          </div>

          <div className="charts-row">
            <div className="chart-card glass">
              <h3 className="chart-title">Tren Bulanan (Kg)</h3>
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.5)' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.5)' }} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                      contentStyle={{ background: '#1A2940', border: 'none', borderRadius: 14, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', color: '#fff' }}
                      labelStyle={{ color: '#94A3B8' }}
                      formatter={(value) => [`${value} Kg`, 'Berat']}
                    />
                    <Bar dataKey="berat" fill="url(#barGradientDS)" radius={[8, 8, 0, 0]} barSize={36} />
                    <defs>
                      <linearGradient id="barGradientDS" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0891B2" />
                        <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card glass">
              <h3 className="chart-title">Komposisi Sampah</h3>
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={3} dataKey="value" stroke="none">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#1A2940', border: 'none', borderRadius: 14, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', color: '#fff' }}
                      formatter={(value) => `${value} Kg`}
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ fontSize: 13 }}
                      formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.6)' }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION PETA INTERAKTIF PENGGUNAAN GOOGLE MAPS DATABASE */}
      <section id="peta" style={{ padding: '100px 24px', background: 'var(--ds-bg)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <span className="glass-badge" style={{ display: 'inline-block', padding: '8px 20px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1.5, background: 'rgba(8, 145, 178, 0.08)', color: 'var(--ds-accent)' }}>Sebaran Lokasi</span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--ds-text)', marginBottom: 12, letterSpacing: '-1px' }}>Peta <span style={{ color: 'var(--ds-accent)' }}>Unit PLN</span></h2>
            <p style={{ color: 'var(--ds-text-muted)', fontSize: '0.95rem', margin: 0 }}>Pilih salah satu unit di bawah ini untuk menampilkan lokasi peta Google Maps secara real-time.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 360px) 1fr', gap: 24, alignItems: 'stretch' }} className="map-layout-grid">
            
            {/* KIRI: Daftar Unit dari Database */}
            <div className="glass-panel" style={{ borderRadius: '1.5rem', padding: '24px', background: 'white', border: '1px solid var(--ds-border)', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--ds-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Navigation size={20} color="var(--ds-accent)" /> Unit Operasional
              </h3>
              
              {loadingMapUnits ? (
                <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--ds-text-muted)', fontSize: '0.9rem' }}>Memuat lokasi unit...</div>
              ) : dbUnits.length === 0 ? (
                <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--ds-text-muted)', fontSize: '0.9rem' }}>Belum ada data unit.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '420px', paddingRight: 4 }}>
                  {dbUnits.map((loc) => {
                    const unitName = loc.nama_unit;
                    const statsForLoc = unitStatsMap[unitName] || { totalWeight: 0, nasabahCount: 0 };
                    const isActive = activeMapLoc?.id === loc.id;
                    const displayName = unitName === 'Banjarnegara' ? 'PLTA PB.Soedirman' : (unitName === 'Wonogiri' ? 'PLTA Wonogiri' : unitName);

                    return (
                      <div
                        key={loc.id}
                        onClick={() => setActiveMapLoc(loc)}
                        style={{
                          padding: '16px',
                          borderRadius: '16px',
                          cursor: 'pointer',
                          transition: 'all 0.25s ease',
                          background: isActive ? 'var(--ds-accent)' : '#FAFCFD',
                          color: isActive ? 'white' : 'var(--ds-text)',
                          border: isActive ? '1px solid var(--ds-accent)' : '1px solid var(--ds-border)',
                          boxShadow: isActive ? '0 8px 24px rgba(8,145,178,0.3)' : 'none',
                        }}
                      >
                        <div style={{ fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8, marginBottom: '8px' }}>
                          <MapPin size={18} color={isActive ? 'white' : 'var(--ds-accent)'} /> {displayName}
                        </div>

                        <div style={{ display: 'flex', gap: '20px', borderTop: isActive ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(203,213,225,0.5)', paddingTop: '8px' }}>
                          <div>
                            <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 700, opacity: isActive ? 0.85 : 0.6 }}>Terkelola</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>{formatWeightTon(statsForLoc.totalWeight)}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 700, opacity: isActive ? 0.85 : 0.6 }}>Nasabah</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>{statsForLoc.nasabahCount}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* KANAN: Iframe Google Maps */}
            <div style={{ position: 'relative', borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid var(--ds-border)', minHeight: '440px', background: '#F8FAFC', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
              {activeMapLoc && (
                <a
                  href={getExternalMapUrl(activeMapLoc)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    position: 'absolute', top: 16, left: 16, zIndex: 10,
                    background: 'white', padding: '8px 16px', borderRadius: 10,
                    textDecoration: 'none', color: 'var(--ds-text)', fontWeight: 700,
                    fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    display: 'inline-flex', alignItems: 'center', gap: 6
                  }}
                >
                  Buka di Maps <ExternalLink size={14} />
                </a>
              )}

              <iframe
                key={activeMapLoc?.id || 'default-map'}
                src={getMapEmbedUrl(activeMapLoc)}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '440px', display: 'block' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Peta Lokasi ${activeMapLoc?.nama_unit || 'Unit PLN'}`}
              />
            </div>

          </div>
        </div>
      </section>

      <section className="section-cta">
        <div className="section-container">
          <div className="cta-card">
            <div className="cta-bg-effects" aria-hidden="true">
              <div className="cta-glow cta-glow-1" />
              <div className="cta-glow cta-glow-2" />
            </div>
            <div className="cta-content">
              <h2 className="cta-title">Mulai kelola data sampah Anda</h2>
              <p className="cta-desc">
                Masuk ke dashboard untuk mencatat, memantau, dan mengelola data sampah dari unit Anda secara real-time.
              </p>
              <div className="cta-buttons">
                <a href="/login" className="btn-cta-primary">
                  Login Sekarang <ArrowRight size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer id="kontak" className="landing-footer">
        <div className="footer-gradient-line" aria-hidden="true" />
        <div className="section-container">
          <div className="footer-grid">
            <div className="footer-brand-col">
              <a href="#hero" className="footer-brand">
                <PLNLogo size={42} unit={activeUnit} />
                <span className="footer-brand-text">
                  <span className="brand-name">Powercycle</span>
                  <span className="brand-tagline">Bank Sampah Digital</span>
                </span>
              </a>
              <p className="footer-desc">
                Platform digital untuk pencatatan, monitoring, dan pelaporan pengelolaan
                sampah yang terintegrasi di wilayah PLN Indonesia Power UBP Mrica.
              </p>
            </div>

            <div className="footer-nav-col">
              <h4 className="footer-col-title">Navigasi</h4>
              <ul className="footer-links">
                <li><a href="#hero">Beranda</a></li>
                <li><a href="#tentang">Tentang</a></li>
                <li><a href="#statistik">Statistik</a></li>
                <li><a href="#peta">Unit</a></li>
              </ul>
            </div>

            <div className="footer-contact-col">
              <h4 className="footer-col-title">Kontak</h4>
              <ul className="footer-contact-list">
                <li>
                  <MapPin size={16} className="footer-contact-icon" />
                  <span>PLTA Mrica, Jawa Tengah</span>
                </li>
                <li>
                  <Phone size={16} className="footer-contact-icon" />
                  <span>(0286) 123456</span>
                </li>
                <li>
                  <Mail size={16} className="footer-contact-icon" />
                  <span>banksampah@pltamrica.co.id</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2026 Powercycle — PLTA Mrica. Semua hak dilindungi.</p>
            <a href="#hero" className="back-to-top">
              Kembali ke atas
              <span className="back-to-top-icon">↑</span>
            </a>
          </div>
        </div>
      </footer>

      <button
        className={`floating-top-btn ${showTopBtn ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Kembali ke atas"
      >
        <ArrowUp size={20} />
      </button>

      <style jsx>{`
        @media (max-width: 900px) {
          .map-layout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}