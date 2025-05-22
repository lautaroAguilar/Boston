const { pool } = require('../../config/database.js')

class UserAuthModel {
  static findOne = async (email) => {
    const connection = await pool.getConnection()
    try {
      const [rows] = await connection.query(
        `SELECT id, first_name, last_name, email, password, role_id, belongs_to, is_temp_password FROM users WHERE email = ?`,
        [email]
      )

      if (rows.length === 0) {
        return null
      }

      return rows[0]
    } catch (err) {
      console.error('Error al buscar usuario:', err)
      throw err
    } finally {
      connection.release()
    }
  }
  static register = async (
    first_name,
    last_name,
    email,
    password,
    roleId,
    belongsTo,
    isTempPassword = false
  ) => {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()
      const [result] = await connection.query(
        `INSERT INTO users (first_name, last_name, email, password, role_id, belongs_to, is_temp_password) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [first_name, last_name, email, password, roleId, belongsTo, isTempPassword]
      )
      await connection.commit()
      return { userId: result.insertId }
    } catch (err) {
      await connection.rollback()
      console.error('Error al registrar el usuario', err)
      throw err
    } finally {
      connection.release()
    }
  }

  static changePassword = async (userId, newPassword, isTempPassword = false) => {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()
      const [result] = await connection.query(
        `UPDATE users SET password = ?, is_temp_password = ? WHERE id = ?`,
        [newPassword, isTempPassword, userId]
      )
      await connection.commit()
      return result.affectedRows > 0
    } catch (err) {
      await connection.rollback()
      console.error('Error al cambiar la contraseña del usuario', err)
      throw err
    } finally {
      connection.release()
    }
  }
}
module.exports = { UserAuthModel }
