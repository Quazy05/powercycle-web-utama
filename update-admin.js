const fs = require('fs');
let content = fs.readFileSync('src/app/components/AdminDashboard.jsx', 'utf8');

// 1. Add import for react-zoom-pan-pinch
if (!content.includes('react-zoom-pan-pinch')) {
  content = content.replace("import {", "import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';\nimport {");
}

// 2. Change image view for documentation
const oldDokImage = `{dok.img_url && (
                          <div style={{ width: '100%', height: 160, overflow: 'hidden' }}>
                            <img src={dok.img_url} alt={dok.kegiatan} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}`;
const newDokImage = `{dok.img_url && (
                          <div 
                            style={{ width: '100%', height: 160, overflow: 'hidden', cursor: 'pointer' }}
                            onClick={() => setFullImage(dok.img_url)}
                          >
                            <img src={dok.img_url} alt={dok.kegiatan} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}`;
content = content.replace(oldDokImage, newDokImage);

// 3. Change delete restriction
// Old: {onDeleteDokumentasi && (role === 'admin llk' || role === 'admin sis') && (
// New: {onDeleteDokumentasi && (!role || role.toLowerCase() === 'admin' || role.toLowerCase() === 'superadmin') && (
content = content.replace(
  "{onDeleteDokumentasi && (role === 'admin llk' || role === 'admin sis') && (",
  "{onDeleteDokumentasi && (!role || role.toLowerCase() === 'admin' || role.toLowerCase() === 'superadmin' || role.toLowerCase() === 'admin portal') && ("
);

// 4. Wrap fullImage with TransformWrapper
const oldFullImage = `{fullImage && (
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

const newFullImage = `{fullImage && (
        <div 
          style={{
            position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <button 
            onClick={() => setFullImage(null)}
            style={{ position: 'absolute', top: 20, right: 20, background: 'white', border: 'none', padding: '10px', borderRadius: '50%', cursor: 'pointer', zIndex: 10001 }}
          >
            <X size={24} />
          </button>
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
                  <img src={fullImage} style={{ maxWidth: '95%', maxHeight: '95%', objectFit: 'contain' }} draggable={false} />
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>
      )}`;
content = content.replace(oldFullImage, newFullImage);

fs.writeFileSync('src/app/components/AdminDashboard.jsx', content);
