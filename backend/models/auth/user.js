const { pool } = require('../../config/database.js')

class UserAuthModel {
  static findOne = async (email) => {
    const connection = await pool.getConnection()
    try {
      const [rows] = await connection.query(
        `SELECT id, first_name, last_name, email, password, role_id, belongs_to FROM users WHERE email = ?`,
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
  static register = async (
    first_name,
    last_name,
    email,
    password,
    roleId,
    belongsTo
  ) => {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()
      const [result] = await connection.query(
        `INSERT INTO users (first_name, last_name, email, password, role_id, belongs_to) VALUES (?, ?, ?, ?, ?, ?)`,
        [first_name, last_name, email, password, roleId, belongsTo]
      )
      await connection.commit()
      return { userId: result.insertId }
    } catch (err) {
      console.log(err)
      await connection.rollback()
      throw new Error(`Hubo un error al crear el usuario `)
    } finally {
      connection.release()
    }
  }
}
module.exports = { UserAuthModel }
