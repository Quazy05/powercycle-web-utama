const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      multipleStatements: true
    });

    console.log('Connected to MySQL server.');

    const sqlFilePath = path.join(__dirname, 'src', 'app', 'lib', 'db-init.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Executing db-init.sql...');
    await connection.query(sql);

    console.log('Database initialized successfully.');

  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initializeDatabase();
