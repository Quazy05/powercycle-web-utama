const fs = require('fs');

// --- ADMIN DASHBOARD ---
let adminContent = fs.readFileSync('src/app/components/AdminDashboard.jsx', 'utf8');

// The exact fullImage modal code currently in AdminDashboard:
const adminOldFullImage = `{fullImage && (
        <div 
          onClick={() => setFullImage(null)} 
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
      )}`;

const adminNewFullImage = `{fullImage && (
        <div 
          style={{
            position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <button 
            onClick={() => setFullImage(null)}
            style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 40, height: 40, borderRadius: '50%', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }}
          >
            ✕
          </button>
          
          <a href={fullImage} download="Dokumentasi.png" style={{ position: 'absolute', top: 20, right: 70, background: '#0891B2', color: 'white', border: 'none', padding: '10px 16px', borderRadius: 8, fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', zIndex: 10001, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={16} /> Download
          </a>

          <TransformWrapper initialScale={1} minScale={0.5} maxScale={5} centerOnInit wheel={{ step: 0.1 }}>
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div style={{ position: 'absolute', bottom: 30, display: 'flex', gap: 10, zIndex: 10001 }}>
                  <button onClick={() => zoomIn()} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Zoom In</button>
                  <button onClick={() => zoomOut()} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Zoom Out</button>
                  <button onClick={() => resetTransform()} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Reset</button>
                </div>
                <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={fullImage} style={{ maxWidth: '95vw', maxHeight: '95vh', objectFit: 'contain' }} draggable={false} />
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>
      )}`;

if(adminContent.includes("onClick={() => setFullImage(null)}")) {
  adminContent = adminContent.replace(adminOldFullImage, adminNewFullImage);
}
fs.writeFileSync('src/app/components/AdminDashboard.jsx', adminContent);


// --- USER DASHBOARD ---
let userContent = fs.readFileSync('src/app/components/UserDashboard.jsx', 'utf8');

// In UserDashboard, we also want to add Download to dokFullImage.
const userOldDokFullImageRegex = /\{dokFullImage && \([\s\S]*?<TransformWrapper[\s\S]*?<\/div>\s*\)\}/;

const userNewDokFullImage = `{dokFullImage && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.9)' }}>
            <button onClick={() => setDokFullImage(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 40, height: 40, borderRadius: '50%', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }}>✕</button>
            
            <a href={dokFullImage} download="Dokumentasi.png" style={{ position: 'absolute', top: 20, right: 70, background: '#0891B2', color: 'white', border: 'none', padding: '10px 16px', borderRadius: 8, fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', zIndex: 10001, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Download size={16} /> Download
            </a>

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

userContent = userContent.replace(userOldDokFullImageRegex, userNewDokFullImage);

// Also we want to add zoom to activeDokPopup img? No, activeDokPopup is just a preview. The user should click it to open full screen (which has zoom). The screenshot shows the popup WITHOUT a Hapus button (wait, the screenshot had a Hapus button, because it was BEFORE my previous fix).
// My previous fix removed the Hapus button.
// To make it clearer that they can click to zoom, let's add a "Klik untuk perbesar" hint to activeDokPopup.

const oldActiveDokImg = `{activeDokPopup.img_url && (
                <div style={{ position: 'relative' }}>
                  <img src={activeDokPopup.img_url} alt={activeDokPopup.kegiatan} onClick={() => setDokFullImage(activeDokPopup.img_url)} style={{ width: '100%', maxHeight: 400, objectFit: 'contain', background: '#000', cursor: 'pointer' }} />
                </div>
              )}`;

const newActiveDokImg = `{activeDokPopup.img_url && (
                <div style={{ position: 'relative' }} title="Klik untuk perbesar dan zoom">
                  <img src={activeDokPopup.img_url} alt={activeDokPopup.kegiatan} onClick={() => setDokFullImage(activeDokPopup.img_url)} style={{ width: '100%', maxHeight: 400, objectFit: 'contain', background: '#000', cursor: 'pointer' }} />
                  <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '6px 10px', borderRadius: 8, fontSize: '0.75rem', pointerEvents: 'none' }}>
                    🔍 Klik untuk Perbesar / Zoom
                  </div>
                </div>
              )}`;
userContent = userContent.replace(oldActiveDokImg, newActiveDokImg);

// Make sure Download icon is imported
if (!userContent.includes('Download } from')) {
  userContent = userContent.replace("} from 'lucide-react';", "Download } from 'lucide-react';");
}

fs.writeFileSync('src/app/components/UserDashboard.jsx', userContent);
