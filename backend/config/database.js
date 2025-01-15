import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()
const DEFAULT_CONFIG = {
  host: 'localhost',
  user: 'root',
  port: '3306',
  password: '',
  database: 'Boston',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}
const connection = process.env.DATABASE_URL ?? DEFAULT_CONFIG
export const pool = mysql.createPool(connection)
