const fs = require('fs');
let c = fs.readFileSync('src/app/components/UserDashboard.jsx', 'utf8');

const uploadModal = `{showUploadDokumentasi && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(12, 26, 46, 0.6)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: 440, borderRadius: '1.5rem', padding: 32, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '1.25rem', fontWeight: 800, color: 'var(--ds-text)', letterSpacing: '-0.5px' }}>Upload Dokumentasi Baru</h3>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--ds-text-muted)', marginBottom: 8 }}>Jenis Kegiatan</label>
              <select 
                value={uploadKegiatan} 
                onChange={(e) => setUploadKegiatan(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid var(--ds-border)', fontSize: '0.95rem', fontFamily: 'inherit', background: '#F8FAFC' }}
              >
                <option value="">-- Pilih Kegiatan --</option>
                <option value="Input Sampah">Input Sampah</option>
                <option value="Input Pemanfaatan (Program)">Input Pemanfaatan (Program)</option>
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--ds-text-muted)', marginBottom: 8 }}>Pilih Gambar</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files[0];
                  if(file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => setUploadFile(ev.target.result);
                    reader.readAsDataURL(file);
                  }
                }}
                style={{ width: '100%', padding: '10px', borderRadius: 12, border: '1.5px dashed var(--ds-accent)', fontSize: '0.9rem', background: '#F0FDFA' }}
              />
              {uploadFile && (
                <div style={{ marginTop: 12, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--ds-border)' }}>
                  <img src={uploadFile} alt="Preview" style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => { setShowUploadDokumentasi(false); setUploadFile(null); setUploadKegiatan(''); }} style={{ flex: 1, padding: '14px', background: 'white', color: 'var(--ds-text)', border: '1.5px solid var(--ds-border)', borderRadius: '9999px', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Batal
              </button>
              <button 
                disabled={!uploadKegiatan || !uploadFile || isUploadingDok}
                onClick={async () => {
                  setIsUploadingDok(true);
                  if(onAddDokumentasi) {
                    await onAddDokumentasi({ kegiatan: uploadKegiatan, img_url: uploadFile, unit: userUnit });
                  }
                  setIsUploadingDok(false);
                  setShowUploadDokumentasi(false);
                  setUploadFile(null);
                  setUploadKegiatan('');
                }} 
                style={{ flex: 1, padding: '14px', background: (!uploadKegiatan || !uploadFile || isUploadingDok) ? '#94A3B8' : 'var(--ds-accent)', color: 'white', border: 'none', borderRadius: '9999px', fontSize: '0.95rem', fontWeight: 700, cursor: (!uploadKegiatan || !uploadFile || isUploadingDok) ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
              >
                {isUploadingDok ? 'Menyimpan...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}`;

c = c.replace('{generatedQr && (', uploadModal + '\n\n      {generatedQr && (');

const uploadBtn = `<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)', margin: 0, letterSpacing: '-0.3px' }}>Dokumentasi Kegiatan</h3>
            <button onClick={() => setShowUploadDokumentasi(true)} style={{ background: 'var(--ds-accent)', color: 'white', border: 'none', borderRadius: 99, padding: '8px 16px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Camera size={16} /> Upload Foto
            </button>
          </div>`;
          
c = c.replace("<h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ds-text)', margin: '0 0 16px 0', letterSpacing: '-0.3px' }}>Dokumentasi Kegiatan</h3>", uploadBtn);

fs.writeFileSync('src/app/components/UserDashboard.jsx', c);
console.log('UI updated');
