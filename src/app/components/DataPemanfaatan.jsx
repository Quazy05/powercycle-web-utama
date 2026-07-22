import React, { useState, useEffect, useMemo } from 'react';
import { Trash2, Edit } from 'lucide-react';
import { KATEGORI_SAMPAH } from '../lib/mockData';

export function DataPemanfaatan() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/input-program');
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus data ini?")) return;
    try {
      const res = await fetch(`/api/input-program/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        alert("Data dihapus!");
        fetchData();
      }
    } catch (e) {
      alert("Error menghapus data.");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditFormData({ ...item });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/input-program/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      const json = await res.json();
      if (json.success) {
        alert("Data diperbarui!");
        setEditingId(null);
        fetchData();
      } else {
        alert(json.error);
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem.");
    }
  };

  if (loading) return <div>Memuat data pemanfaatan...</div>;

  return (
    <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 20 }}>Data Input Pemanfaatan</h3>

      {editingId && (
        <form onSubmit={handleSave} style={{ background: '#F8FAFC', padding: 20, borderRadius: 12, marginBottom: 20 }}>
          <h4 style={{ margin: '0 0 16px 0' }}>Edit Data</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: 6 }}>User</label>
              <input type="text" value={editFormData.user || ''} onChange={e => setEditFormData({...editFormData, user: e.target.value})} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #E2E8F0' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: 6 }}>Kategori Sampah</label>
              <select value={editFormData.kategori_sampah || ''} onChange={e => setEditFormData({...editFormData, kategori_sampah: e.target.value})} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <option value="">Pilih Kategori</option>
                <option value="Organik">Organik</option>
                <option value="Anorganik">Anorganik</option>
                <option value="B3">B3</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" style={{ flex: 1, background: '#3B82F6', color: 'white', padding: 10, borderRadius: 8, border: 'none', fontWeight: 700, cursor: 'pointer' }}>Simpan</button>
            <button type="button" onClick={() => setEditingId(null)} style={{ flex: 1, background: 'white', border: '1px solid #E2E8F0', padding: 10, borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Batal</button>
          </div>
        </form>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#F1F5F9' }}>
              <th style={{ padding: 12, fontSize: '0.85rem' }}>Tanggal</th>
              <th style={{ padding: 12, fontSize: '0.85rem' }}>User / Unit</th>
              <th style={{ padding: 12, fontSize: '0.85rem' }}>Program</th>
              <th style={{ padding: 12, fontSize: '0.85rem' }}>Kategori & Jenis</th>
              <th style={{ padding: 12, fontSize: '0.85rem' }}>Data Pemanfaatan</th>
              <th style={{ padding: 12, fontSize: '0.85rem', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: 12, fontSize: '0.9rem' }}>{item.date} <br/><small style={{ color: '#64748B' }}>{item.time}</small></td>
                <td style={{ padding: 12, fontSize: '0.9rem' }}>{item.user} <br/><small style={{ color: '#64748B' }}>{item.unit}</small></td>
                <td style={{ padding: 12, fontSize: '0.9rem', fontWeight: 600 }}>{item.program_name}</td>
                <td style={{ padding: 12, fontSize: '0.9rem' }}>{item.kategori_sampah || '-'} <br/><small style={{ color: '#64748B' }}>{item.jenis_sampah || '-'}</small></td>
                <td style={{ padding: 12, fontSize: '0.85rem' }}>
                  {item.form_data && Object.keys(item.form_data).map(k => {
                    const val = item.form_data[k];
                    const isNumeric = !isNaN(val) && val !== '';
                    return (
                      <div key={k}>{k.replace(/_/g, ' ')}: <strong>{val}{isNumeric ? ' Kg' : ''}</strong></div>
                    );
                  })}
                </td>
                <td style={{ padding: 12, textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button onClick={() => handleEdit(item)} style={{ background: '#E0F2FE', color: '#0284C7', padding: 6, borderRadius: 6, border: 'none', cursor: 'pointer' }}><Edit size={16} /></button>
                  <button onClick={() => handleDelete(item.id)} style={{ background: '#FEE2E2', color: '#EF4444', padding: 6, borderRadius: 6, border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
