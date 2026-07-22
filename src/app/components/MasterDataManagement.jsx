import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Plus, X } from 'lucide-react';

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
        if(json.success) setDataJenis(json.data);
      } else if (activeTab === 'unit') {
        const res = await fetch('/api/master/unit');
        const json = await res.json();
        if(json.success) setDataUnit(json.data);
      } else if (activeTab === 'pengelola') {
        const res = await fetch('/api/master/pengelola');
        const json = await res.json();
        if(json.success) setDataPengelola(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
        alert('Gagal: ' + data.error);
      }
    } catch (err) {
      alert('Terjadi kesalahan');
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
      alert('Terjadi kesalahan');
    }
  };

  const inputStyle = { padding: '10px 14px', border: '1.5px solid var(--ds-border)', borderRadius: 10, fontSize: '0.875rem', outline: 'none', width: '100%', marginBottom: 12 };

  const renderForm = () => {
    if (!formType) return null;
    return (
      <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 12, marginBottom: 20, border: '1px solid var(--ds-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h4 style={{ margin: 0, fontWeight: 700 }}>{formType === 'add' ? 'Tambah Data' : 'Edit Data'}</h4>
          <button onClick={() => setFormType('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          {activeTab === 'jenis_sampah' && (
            <>
              <input style={inputStyle} placeholder="Nama Jenis (misal: Daun)" required value={formData.nama_jenis || ''} onChange={e => setFormData({...formData, nama_jenis: e.target.value})} />
              <select style={inputStyle} required value={formData.kategori || ''} onChange={e => setFormData({...formData, kategori: e.target.value})}>
                <option value="">Pilih Kategori</option>
                <option value="Organik">Organik</option>
                <option value="Anorganik">Anorganik</option>
                <option value="Residu">Residu</option>
              </select>
            </>
          )}
          {activeTab === 'unit' && (
            <input style={inputStyle} placeholder="Nama Unit" required value={formData.nama_unit || ''} onChange={e => setFormData({...formData, nama_unit: e.target.value})} />
          )}
          {activeTab === 'pengelola' && (
            <input style={inputStyle} placeholder="Nama Pengelola" required value={formData.nama_pengelola || ''} onChange={e => setFormData({...formData, nama_pengelola: e.target.value})} />
          )}
          <button type="submit" style={{ background: 'var(--ds-accent)', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Simpan</button>
        </form>
      </div>
    );
  };

  const renderTable = () => {
    if (loading) return <p>Loading...</p>;
    let headers = [];
    let rows = [];

    if (activeTab === 'jenis_sampah') {
      headers = ['Kategori', 'Jenis'];
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
      headers = ['Nama Unit'];
      rows = dataUnit.map(d => (
        <tr key={d.id} style={{ borderBottom: '1px solid var(--ds-border)' }}>
          <td style={{ padding: '12px', fontWeight: 600 }}>{d.nama_unit}</td>
          <td style={{ padding: '12px', textAlign: 'right' }}>
            <button onClick={() => { setFormType('edit'); setFormData(d); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3B82F6', marginRight: 12 }}><Edit size={16} /></button>
            <button onClick={() => handleDelete(d.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}><Trash2 size={16} /></button>
          </td>
        </tr>
      ));
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
        <tbody>{rows}</tbody>
      </table>
    );
  };

  return (
    <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(8, 145, 178, 0.03)', border: '1px solid var(--ds-border)' }}>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)', marginBottom: 20 }}>Manajemen Data Master</h3>
      
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid var(--ds-border)', paddingBottom: 16 }}>
        {['jenis_sampah', 'unit', 'pengelola'].map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setFormType(''); }}
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
