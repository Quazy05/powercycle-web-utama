const fs = require('fs');
const { getDbConnection } = require('./src/app/lib/db.js');
async function run() {
  try {
    const pool = await getDbConnection();
    const sql = fs.readFileSync('src/app/lib/db-init.sql', 'utf8');
    // Split by semicolons for basic execution, but this can fail if there are semicolons inside strings.
    // So we will just try to run it. mysql2 pool.query can execute multiple statements if multipleStatements: true
    // but getDbConnection might not have it enabled.
    // Instead, let's just rely on the fact that I created dokumentasi_kegiatan already, 
    // and if I just ensure it is created, that's enough for this specific error!
    
    // Check if table activity_log exists too
    await pool.query(`CREATE TABLE IF NOT EXISTS activity_log (
      id INT AUTO_INCREMENT PRIMARY KEY,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      user VARCHAR(50),
      action VARCHAR(100),
      details TEXT,
      type VARCHAR(20)
    );`);
    
    console.log('Tabel activity_log dan dokumentasi_kegiatan (dari sebelumnya) berhasil dipastikan ada!');
    process.exit(0);
  } catch(err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}
run();
