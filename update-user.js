const fs = require('fs');
let content = fs.readFileSync('src/app/components/UserDashboard.jsx', 'utf8');

// 1. Add import for react-zoom-pan-pinch
if (!content.includes('react-zoom-pan-pinch')) {
  content = content.replace("import {", "import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';\nimport {");
}

// 2. Remove onDeleteDokumentasi button from activeDokPopup
const oldDeleteBtn = `{onDeleteDokumentasi && (
                    <button onClick={() => { if (confirm('Hapus dokumentasi ini?')) { onDeleteDokumentasi(activeDokPopup.id); setActiveDokPopup(null); }}} style={{ padding: '10px 20px', background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit' }}>
                      <Trash2 size={14} style={{ marginRight: 6 }} />Hapus
                    </button>
                  )}`;
content = content.replace(oldDeleteBtn, "");


// 3. Wrap dokFullImage with TransformWrapper
const oldDokFull = `{dokFullImage && (
          <div onClick={() => setDokFullImage(null)} style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.9)', cursor: 'pointer' }}>
            <img src={dokFullImage} alt="Full" style={{ maxWidth: '95vw', maxHeight: '95vh', objectFit: 'contain' }} />
            <button onClick={() => setDokFullImage(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 40, height: 40, borderRadius: '50%', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
        )}`;

const newDokFull = `{dokFullImage && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.9)' }}>
            <button onClick={() => setDokFullImage(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 40, height: 40, borderRadius: '50%', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }}>✕</button>
            <TransformWrapper
              initialScale={1}
              minScale={0.5}
              maxScale={5}
              centerOnInit
              wheel={{ step: 0.1 }}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  <div style={{ position: 'absolute', bottom: 30, display: 'flex', gap: 10, zIndex: 10001 }}>
                    <button onClick={() => zoomIn()} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Zoom In</button>
                    <button onClick={() => zoomOut()} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Zoom Out</button>
                    <button onClick={() => resetTransform()} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Reset</button>
                  </div>
                  <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={dokFullImage} alt="Full" style={{ maxWidth: '95vw', maxHeight: '95vh', objectFit: 'contain' }} draggable={false} />
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>
          </div>
        )}`;
content = content.replace(oldDokFull, newDokFull);

fs.writeFileSync('src/app/components/UserDashboard.jsx', content);
