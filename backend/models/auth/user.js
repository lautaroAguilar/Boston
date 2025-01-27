import { pool } from '../../config/database.js'

export class UserAuthModel {
  static findOne = async (email) => {
    const connection = await pool.getConnection()
    try {
      const [rows] = await connection.query(
        `SELECT id, email, password FROM users WHERE email = ?`,
        [email]
      )

      if (rows.length === 0) {
        return null
      }

      return rows[0]
    } catch (err) {
      console.error('Error al buscar usuario:', err)
    } finally {
      connection.release()
    }
  }
  static register = async (name, email, password, role) => {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()
      const [result] = await connection.query(
        `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
        [name, email, password]
      )
      const userId = result.insertId
      const [roleResult] = await connection.query(
        `INSERT INTO roles (name, user_id) VALUES (?, ?)`,
        [role, userId]
      )
      await connection.commit()
      return { userId, roleId: roleResult.insertId }
    } catch (err) {
      console.log(err)
      await connection.rollback()
      throw new Error(`Hubo un error al crear el usuario `)
    } finally {
      connection.release()
    }
  }
}
