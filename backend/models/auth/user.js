const { pool } = require('../../config/database.js')

class UserAuthModel {
  static findOne = async (email) => {
    const connection = await pool.getConnection()
    try {
      const [rows] = await connection.query(
        `SELECT 
          id, 
          first_name, 
          last_name, 
          email, 
          password, 
          role_id, 
          belongs_to, 
          is_temp_password,
          active 
        FROM users 
        WHERE email = ? AND active = 1`,
        [email]
      )

      if (rows.length === 0) {
        return null
      }

      if (!rows[0].password) {
        console.error(`Usuario ${email} encontrado pero sin contraseña almacenada`);
      }

      return rows[0]
    } catch (err) {
      console.error('Error al buscar usuario:', err)
      throw err
    } finally {
      connection.release()
    }
  }

  static findById = async (userId) => {
    const connection = await pool.getConnection()
    try {
      const [rows] = await connection.query(
        `SELECT id, first_name, last_name, email, password, role_id, belongs_to, is_temp_password FROM users WHERE id = ?`,
        [userId]
      )

      if (rows.length === 0) {
        return null
      }

      return rows[0]
    } catch (err) {
      console.error('Error al buscar usuario por ID:', err)
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
    if (!newPassword) {
      throw new Error('La nueva contraseña es requerida');
    }

    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()
      
      // Primero verificamos que el usuario exista
      const [user] = await connection.query(
        'SELECT id FROM users WHERE id = ?',
        [userId]
      );

      if (user.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      const [result] = await connection.query(
        `UPDATE users 
         SET password = ?, 
             is_temp_password = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [newPassword, isTempPassword, userId]
      )

      if (result.affectedRows === 0) {
        throw new Error('No se pudo actualizar la contraseña');
      }

      await connection.commit()
      return true;
    } catch (err) {
      await connection.rollback()
      console.error('Error al cambiar la contraseña del usuario:', err)
      throw err
    } finally {
      connection.release()
    }
  }
}
module.exports = { UserAuthModel }
