'use client';
import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Plus, X, MapPin } from 'lucide-react';

export function MasterDataManagement() {
  const [activeTab, setActiveTab] = useState('jenis_sampah');
  const [dataJenis, setDataJenis] = useState([]);
  const [dataUnit, setDataUnit] = useState([]);
  const [dataPengelola, setDataPengelola] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formType, setFormType] = useState(''); // 'add' or 'edit'
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'jenis_sampah') {
        const res = await fetch('/api/master/jenis-sampah');
        const json = await res.json();
        if (json.success) setDataJenis(json.data);
      } else if (activeTab === 'unit') {
        const res = await fetch('/api/master/unit');
        const json = await res.json();
        if (json.success) setDataUnit(json.data);
      } else if (activeTab === 'pengelola') {
        const res = await fetch('/api/master/pengelola');
        const json = await res.json();
        if (json.success) setDataPengelola(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran foto terlalu besar (maksimal 2MB)');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setFormData(prev => ({ ...prev, image_url: uploadEvent.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let endpoint = '';
      if (activeTab === 'jenis_sampah') endpoint = '/api/master/jenis-sampah';
      if (activeTab === 'unit') endpoint = '/api/master/unit';
      if (activeTab === 'pengelola') endpoint = '/api/master/pengelola';

      const method = formType === 'add' ? 'POST' : 'PUT';
      
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        alert('Data berhasil disimpan');
        setFormType('');
        setFormData({});
        fetchData();
      } else {
        alert('Gagal: ' + (data.error || 'Terjadi kesalahan saat menyimpan'));
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus data ini?')) return;
    try {
      let endpoint = '';
      if (activeTab === 'jenis_sampah') endpoint = '/api/master/jenis-sampah';
      if (activeTab === 'unit') endpoint = '/api/master/unit';
      if (activeTab === 'pengelola') endpoint = '/api/master/pengelola';

      const res = await fetch(`${endpoint}?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert('Gagal hapus: ' + data.error);
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
    }
  };

  const inputStyle = { padding: '10px 14px', border: '1.5px solid var(--ds-border)', borderRadius: 10, fontSize: '0.875rem', outline: 'none', width: '100%', marginBottom: 12, boxSizing: 'border-box' };

  const renderForm = () => {
    if (!formType) return null;
    return (
      <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 12, marginBottom: 20, border: '1px solid var(--ds-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h4 style={{ margin: 0, fontWeight: 700 }}>{formType === 'add' ? 'Tambah Data Unit' : 'Edit Data Unit'}</h4>
          <button onClick={() => { setFormType(''); setFormData({}); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          {activeTab === 'jenis_sampah' && (
            <>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Nama Jenis Sampah</label>
              <input style={inputStyle} placeholder="Nama Jenis (misal: Daun)" required value={formData.nama_jenis || ''} onChange={e => setFormData({...formData, nama_jenis: e.target.value})} />
              
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Kategori Sampah</label>
              <select style={inputStyle} required value={formData.kategori || ''} onChange={e => setFormData({...formData, kategori: e.target.value})}>
                <option value="">Pilih Kategori</option>
                <option value="Organik">Organik</option>
                <option value="Anorganik">Anorganik</option>
                <option value="Residu">Residu</option>
              </select>
            </>
          )}

          {activeTab === 'unit' && (
            <>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Nama Unit</label>
              <input style={inputStyle} placeholder="Nama Unit (misal: Jakarta)" required value={formData.nama_unit || ''} onChange={e => setFormData({...formData, nama_unit: e.target.value})} />
              
              {/* URL Google Maps */}
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Link / URL Google Maps</label>
              <input 
                style={inputStyle} 
                placeholder="Masukkan URL/Link Google Maps atau Embed Link" 
                value={formData.map_url || ''} 
                onChange={e => setFormData({...formData, map_url: e.target.value})} 
              />

              {/* Foto Unit */}
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Foto / Gambar Unit</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  style={{ fontSize: '0.85rem' }} 
                />
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Atau masukkan Path Gambar:</span>
                <input 
                  style={{ ...inputStyle, marginBottom: 0 }} 
                  placeholder="misal: /PLTA Wonogiri.jpeg" 
                  value={formData.image_url || ''} 
                  onChange={e => setFormData({...formData, image_url: e.target.value})} 
                />

                {formData.image_url && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12, background: 'white', padding: 8, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }} 
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <span style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 600 }}>Gambar terdeteksi</span>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'pengelola' && (
            <>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>Nama Pengelola</label>
              <input style={inputStyle} placeholder="Nama Pengelola" required value={formData.nama_pengelola || ''} onChange={e => setFormData({...formData, nama_pengelola: e.target.value})} />
            </>
          )}

          <button type="submit" style={{ background: 'var(--ds-accent)', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Simpan</button>
        </form>
      </div>
    );
  };

  const renderTable = () => {
    if (loading) return <p style={{ textAlign: 'center', padding: 20, color: '#64748B' }}>Memuat data master...</p>;
    let headers = [];
    let rows = [];

    if (activeTab === 'jenis_sampah') {
      headers = ['Kategori', 'Jenis Sampah'];
      rows = dataJenis.map(d => (
        <tr key={d.id} style={{ borderBottom: '1px solid var(--ds-border)' }}>
          <td style={{ padding: '12px' }}>{d.kategori}</td>
          <td style={{ padding: '12px', fontWeight: 600 }}>{d.nama_jenis}</td>
          <td style={{ padding: '12px', textAlign: 'right' }}>
            <button onClick={() => { setFormType('edit'); setFormData(d); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3B82F6', marginRight: 12 }}><Edit size={16} /></button>
            <button onClick={() => handleDelete(d.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}><Trash2 size={16} /></button>
          </td>
        </tr>
      ));
    } else if (activeTab === 'unit') {
      headers = ['Foto Unit', 'Nama Unit', 'Status Maps'];
      rows = dataUnit.map(d => {
        const imageUrl = d.image_url || (d.nama_unit?.toLowerCase().includes('wonogiri') ? '/PLTA Wonogiri.jpeg' : (d.nama_unit?.toLowerCase().includes('banjarnegara') ? '/PLTA PB. Soedirman.jpeg' : '/Logo.png'));

        return (
          <tr key={d.id} style={{ borderBottom: '1px solid var(--ds-border)' }}>
            <td style={{ padding: '12px', width: 80 }}>
              <div style={{ width: 50, height: 50, borderRadius: 8, overflow: 'hidden', border: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img 
                  src={imageUrl} 
                  alt={d.nama_unit} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
            </td>
            <td style={{ padding: '12px', fontWeight: 600 }}>{d.nama_unit}</td>
            <td style={{ padding: '12px', fontSize: '0.825rem', color: '#64748B' }}>
              {d.map_url ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#047857', fontWeight: 600 }}>
                  <MapPin size={14} /> Link Maps Terpasang
                </span>
              ) : (
                <span style={{ fontStyle: 'italic', color: '#94A3B8' }}>Pencarian Otomatis</span>
              )}
            </td>
            <td style={{ padding: '12px', textAlign: 'right' }}>
              <button onClick={() => { setFormType('edit'); setFormData(d); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3B82F6', marginRight: 12 }}><Edit size={16} /></button>
              <button onClick={() => handleDelete(d.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}><Trash2 size={16} /></button>
            </td>
          </tr>
        );
      });
    } else if (activeTab === 'pengelola') {
      headers = ['Nama Pengelola'];
      rows = dataPengelola.map(d => (
        <tr key={d.id} style={{ borderBottom: '1px solid var(--ds-border)' }}>
          <td style={{ padding: '12px', fontWeight: 600 }}>{d.nama_pengelola}</td>
          <td style={{ padding: '12px', textAlign: 'right' }}>
            <button onClick={() => { setFormType('edit'); setFormData(d); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3B82F6', marginRight: 12 }}><Edit size={16} /></button>
            <button onClick={() => handleDelete(d.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}><Trash2 size={16} /></button>
          </td>
        </tr>
      ));
    }

    return (
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
        <thead>
          <tr style={{ background: '#F8FAFC', borderBottom: '2px solid var(--ds-border)' }}>
            {headers.map(h => <th key={h} style={{ padding: '12px' }}>{h}</th>)}
            <th style={{ padding: '12px', textAlign: 'right' }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length + 1} style={{ padding: 20, textAlign: 'center', color: '#64748B' }}>Belum ada data master.</td>
            </tr>
          ) : rows}
        </tbody>
      </table>
    );
  };

  return (
    <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)', marginBottom: 20 }}>Manajemen Data Master</h3>
      
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid var(--ds-border)', paddingBottom: 16 }}>
        {['jenis_sampah', 'unit', 'pengelola'].map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setFormType(''); setFormData({}); }}
            style={{ 
              background: activeTab === tab ? 'var(--ds-accent)' : 'transparent', 
              color: activeTab === tab ? 'white' : 'var(--ds-text-muted)',
              border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 600, cursor: 'pointer'
            }}>
            {tab.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {!formType && (
        <button onClick={() => { setFormType('add'); setFormData({}); }} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#10B981', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, marginBottom: 20 }}>
          <Plus size={16} /> Tambah Data
        </button>
      )}

      {renderForm()}
      {renderTable()}
    </div>
  );
}