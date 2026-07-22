import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

export function ManajemenProgram() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    id: '', nama: '', deskripsi: '', fields: []
  });

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/programs');
      const data = await res.json();
      if (data.success) setPrograms(data.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleEdit = (prog) => {
    setEditingId(prog.id);
    setFormData({
      id: prog.id,
      nama: prog.nama,
      deskripsi: prog.deskripsi,
      fields: prog.fields || []
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ id: '', nama: '', deskripsi: '', fields: [] });
  };

  const addField = () => {
    setFormData({
      ...formData,
      fields: [...formData.fields, { id: '', label: '', type: 'number' }]
    });
  };

  const updateField = (index, key, value) => {
    const newFields = [...formData.fields];
    newFields[index] = { ...newFields[index], [key]: value };
    if (key === 'label') {
        newFields[index].id = value.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }
    setFormData({ ...formData, fields: newFields });
  };

  const removeField = (index) => {
    const newFields = [...formData.fields];
    newFields.splice(index, 1);
    setFormData({ ...formData, fields: newFields });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama || formData.fields.length === 0) {
      alert("Nama program dan setidaknya satu field harus diisi!");
      return;
    }

    try {
      const method = editingId === 'NEW' ? 'POST' : 'PUT';
      const endpoint = editingId === 'NEW' ? '/api/programs' : `/api/programs/${editingId}`;
      
      const payload = { ...formData };
      if (editingId === 'NEW' && !payload.id) {
          payload.id = payload.nama.toLowerCase().replace(/[^a-z0-9]/g, '_');
      }

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        alert("Program berhasil disimpan!");
        handleCancel();
        fetchPrograms();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Terjadi kesalahan.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus program ini?")) return;
    try {
      const res = await fetch(`/api/programs/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert("Terhapus!");
        fetchPrograms();
      } else {
        alert(data.error || "Gagal menghapus program");
      }
    } catch (e) {
      alert("Error menghapus program.");
    }
  };

  if (loading) return <div>Memuat...</div>;

  return (
    <div style={{ background: 'white', borderRadius: '1.5rem', padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Manajemen Program</h3>
        {!editingId && (
          <button onClick={() => {
            setEditingId('NEW');
            setFormData({ id: '', nama: '', deskripsi: '', fields: [{ id: 'jumlah', label: 'Jumlah (kg)', type: 'number' }] });
          }} style={{ background: '#10B981', color: 'white', padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
            <Plus size={16} /> Tambah Program
          </button>
        )}
      </div>

      {editingId ? (
        <form onSubmit={handleSubmit} style={{ background: '#F8FAFC', padding: 20, borderRadius: 12, marginBottom: 20 }}>
          <h4 style={{ margin: '0 0 16px 0' }}>{editingId === 'NEW' ? 'Tambah' : 'Edit'} Program</h4>
          
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 700, fontSize: '0.9rem' }}>Nama Program</label>
            <input type="text" required value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #E2E8F0' }} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 700, fontSize: '0.9rem' }}>Deskripsi</label>
            <textarea value={formData.deskripsi} onChange={e => setFormData({...formData, deskripsi: e.target.value})} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #E2E8F0', height: 80 }} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, fontSize: '0.9rem' }}>Field Input Kustom</label>
            {formData.fields.map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <input type="text" placeholder="Label Field (Contoh: Sampah Kertas)" value={f.label} onChange={e => updateField(i, 'label', e.target.value)} required style={{ flex: 2, padding: 8, borderRadius: 6, border: '1px solid #E2E8F0' }} />
                <select value={f.type} onChange={e => updateField(i, 'type', e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #E2E8F0' }}>
                  <option value="number">Angka (Number)</option>
                  <option value="text">Teks (Text)</option>
                </select>
                <button type="button" onClick={() => removeField(i)} style={{ background: '#EF4444', color: 'white', border: 'none', borderRadius: 6, padding: '0 12px', cursor: 'pointer' }}><Trash2 size={16} /></button>
              </div>
            ))}
            <button type="button" onClick={addField} style={{ background: '#E2E8F0', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>+ Tambah Field</button>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" style={{ flex: 1, background: '#3B82F6', color: 'white', padding: 10, borderRadius: 8, border: 'none', fontWeight: 700, cursor: 'pointer' }}>Simpan</button>
            <button type="button" onClick={handleCancel} style={{ flex: 1, background: 'white', border: '1px solid #E2E8F0', padding: 10, borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Batal</button>
          </div>
        </form>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F1F5F9', textAlign: 'left' }}>
              <th style={{ padding: 12 }}>Nama Program</th>
              <th style={{ padding: 12 }}>Jumlah Field</th>
              <th style={{ padding: 12, textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {programs.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: 12, fontWeight: 600 }}>{p.nama}</td>
                <td style={{ padding: 12 }}>{p.fields?.length || 0} fields</td>
                <td style={{ padding: 12, textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button onClick={() => handleEdit(p)} style={{ background: '#E0F2FE', color: '#0284C7', padding: 6, borderRadius: 6, border: 'none', cursor: 'pointer' }}><Edit size={16} /></button>
                  <button onClick={() => handleDelete(p.id)} style={{ background: '#FEE2E2', color: '#EF4444', padding: 6, borderRadius: 6, border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
