import { pool } from '../../config/database.js'

export class UserAuthModel {
  static findOne = async (email) => {
    const connection = await pool.getConnection()
    try {
      const [rows] = await connection.query(
        `SELECT id, name, email, password, role_id FROM users WHERE email = ?`,
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
      const [roleResult] = await connection.query(
        `INSERT INTO roles (name) VALUES (?)`,
        [role]
      )
      const roleId = roleResult.insertId
      const [result] = await connection.query(
        `INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)`,
        [name, email, password, roleId]
      )
      await connection.commit()
      return { userId: result.insertId, roleId }
    } catch (err) {
      console.log(err)
      await connection.rollback()
      throw new Error(`Hubo un error al crear el usuario `)
    } finally {
      connection.release()
    }
  }
}
