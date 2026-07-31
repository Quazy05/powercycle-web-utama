const fs = require('fs');

// --- ADMIN DASHBOARD ---
try {
  let adminContent = fs.readFileSync('src/app/components/AdminDashboard.jsx', 'utf8');

  // Look for the exact block using string manipulation
  const adminStart = adminContent.indexOf('{fullImage && (');
  if (adminStart !== -1) {
    const adminOldFullImage = adminContent.substring(adminStart, adminContent.indexOf(')}', adminStart) + 2);
    
    // Only replace if it matches the old one without TransformWrapper
    if (!adminOldFullImage.includes('TransformWrapper')) {
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
                  <button onClick={() => zoomIn()} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 'bold', background: 'white', color: 'black' }}>Zoom In</button>
                  <button onClick={() => zoomOut()} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 'bold', background: 'white', color: 'black' }}>Zoom Out</button>
                  <button onClick={() => resetTransform()} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 'bold', background: 'white', color: 'black' }}>Reset</button>
                </div>
                <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={fullImage} style={{ maxWidth: '95vw', maxHeight: '95vh', objectFit: 'contain' }} draggable={false} />
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>
      )}`;
      
      adminContent = adminContent.replace(adminOldFullImage, adminNewFullImage);
      fs.writeFileSync('src/app/components/AdminDashboard.jsx', adminContent);
      console.log('AdminDashboard updated successfully!');
    } else {
      console.log('AdminDashboard already has TransformWrapper.');
    }
  }
} catch (e) {
  console.error(e);
}

// --- USER DASHBOARD ---
try {
  let userContent = fs.readFileSync('src/app/components/UserDashboard.jsx', 'utf8');

  // Add the styling to buttons in UserDashboard
  userContent = userContent.replace(/<button onClick=\{\(\) => zoomIn\(\)\} style=\{\{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 'bold' \}\}>Zoom In<\/button>/g, 
                                    "<button onClick={() => zoomIn()} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 'bold', background: 'white', color: 'black' }}>Zoom In</button>");
  
  userContent = userContent.replace(/<button onClick=\{\(\) => zoomOut\(\)\} style=\{\{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 'bold' \}\}>Zoom Out<\/button>/g, 
                                    "<button onClick={() => zoomOut()} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 'bold', background: 'white', color: 'black' }}>Zoom Out</button>");
                                    
  userContent = userContent.replace(/<button onClick=\{\(\) => resetTransform\(\)\} style=\{\{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 'bold' \}\}>Reset<\/button>/g, 
                                    "<button onClick={() => resetTransform()} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 'bold', background: 'white', color: 'black' }}>Reset</button>");


  // If the download button is missing in dokFullImage, add it!
  if (!userContent.includes('download="Dokumentasi.png"')) {
    const crossButton = `<button onClick={() => setDokFullImage(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 40, height: 40, borderRadius: '50%', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }}>✕</button>`;
    
    const crossButtonWithDownload = `${crossButton}\n            <a href={dokFullImage} download="Dokumentasi.png" style={{ position: 'absolute', top: 20, right: 70, background: '#0891B2', color: 'white', border: 'none', padding: '10px 16px', borderRadius: 8, fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', zIndex: 10001, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>\n              <Download size={16} /> Download\n            </a>`;
    
    userContent = userContent.replace(crossButton, crossButtonWithDownload);
  }

  fs.writeFileSync('src/app/components/UserDashboard.jsx', userContent);
  console.log('UserDashboard updated successfully!');
} catch (e) {
  console.error(e);
}
