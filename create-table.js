const { getDbConnection } = require('./src/app/lib/db.js');
async function run() {
  try {
    const pool = await getDbConnection();
    await pool.query(`CREATE TABLE IF NOT EXISTS dokumentasi_kegiatan (
      id VARCHAR(50) PRIMARY KEY,
      kegiatan VARCHAR(255) NOT NULL,
      img_url LONGTEXT,
      unit VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);
    console.log('Tabel dokumentasi_kegiatan berhasil dibuat');
    process.exit(0);
  } catch(err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}
run();
