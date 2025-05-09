const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  port: process.env.DB_PORT || '3306',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'Boston',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(config);

module.exports = { pool };
