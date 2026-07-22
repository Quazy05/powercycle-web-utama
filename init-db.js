const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  let connection;
  try {
    // First drop the old database to start fresh
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      multipleStatements: true
    });

    console.log('Connected to MySQL server.');
    
    // Drop old database
    await connection.query('DROP DATABASE IF EXISTS bank_sampah_mrica');
    console.log('Dropped old database (if existed).');

    const sqlFilePath = path.join(__dirname, 'src', 'app', 'lib', 'db-init.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Executing db-init.sql...');
    await connection.query(sql);

    console.log('Database bank_sampah_mrica initialized successfully.');

  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initializeDatabase();
