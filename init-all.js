const fs = require('fs');
const mysql = require('mysql2/promise');

async function run() {
  try {
    const config = {
      host: (process.env.DB_HOST || 'localhost').trim(),
      user: (process.env.DB_USER || 'root').trim(),
      password: (process.env.DB_PASSWORD || '').trim(),
      database: (process.env.DB_NAME || 'bank_sampah-new').trim(),
      port: parseInt(process.env.DB_PORT || '3306', 10),
      multipleStatements: true
    };
    const connection = await mysql.createConnection(config);
    const sql = fs.readFileSync('src/app/lib/db-init.sql', 'utf8');
    await connection.query(sql);
    console.log('Seluruh db-init.sql berhasil dijalankan di bank_sampah-new!');
    process.exit(0);
  } catch(err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}
run();
