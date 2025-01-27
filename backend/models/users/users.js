import { pool } from '../../config/database.js'

export class UserModel {
  static getAll = async () => {
    const connection = await pool.getConnection()
    try {
      const [users] = await connection.query(
        `SELECT id, name, email FROM users`
      )
      return users
    } catch (error) {
      console.error('Error al buscar los usuarios:', error)
      throw new Error(`Hubo un error al buscar los usuarios`)
    } finally {
      connection.release()
    }
  }
  static getById = async (userId) => {
    const connection = await pool.getConnection()
    try {
      const [user] = await connection.query(
        `SELECT id, name, email 
              FROM users u 
              WHERE u.id = ?`,
        [userId]
      )
      if (user.length === 0) {
        return null
      }
      return user
    } catch (error) {
      console.error('Error al buscar el usuario:', error)
      throw new Error(`Hubo un error al buscar el usuario`)
    } finally {
      connection.release()
    }
  }
  static deleteById = async (userId) => {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()
      const [result] = await connection.query(
        `DELETE FROM users WHERE id = ?`,
        [userId]
      )
      await connection.commit()
      return result.affectedRows
    } catch (error) {
      await connection.rollback()
      console.error('Error deleting user:', error)
      throw new Error(`Hubo un error al eliminar el usuario`)
    } finally {
      connection.release()
    }
  }
  static updateById = async (userId, updateData) => {
    const connection = await pool.getConnection()
    try {
      /* Se crean las clausulas dinámicamente */
      const clauses = Object.keys(updateData)
        .map((key) => `${key} = ?`)
        .join(', ')
      /* Se  */
      const values = Object.values(updateData)

      const [result] = await connection.query(
        `UPDATE users SET ${clauses} WHERE id = ?`,
        [...values, userId]
      )

      return result.affectedRows
    } catch (error) {
      console.error('Error al actualizar el usuario:', error)
      throw new Error('Hubo un error al actualizar el usuario')
    } finally {
      connection.release()
    }
  }
}
