import mysql from 'mysql2/promise';
import dotenv from 'dotenv';


const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.test';
dotenv.config({ path: envFile });

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

export const pool = mysql.createPool(config);
