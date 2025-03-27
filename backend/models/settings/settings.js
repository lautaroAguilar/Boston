const { pool } = require('../../config/database.js')

class SettingsModel {
  static async getAllModules() {
    const connection = await pool.getConnection()
    try {
      const [rows] = await connection.query(`SELECT id, name FROM modules`)
      return rows
    } catch (error) {
      console.error('Error al obtener módulos', error)
      throw error
    } finally {
      connection.release()
    }
  }
  static async getAllLanguages() {
    const connection = await pool.getConnection()
    try {
      const [rows] = await connection.query(`SELECT id, name FROM languages`)
      return rows
    } catch (error) {
      console.error('Error al obtener idiomas', error)
      throw error
    } finally {
      connection.release()
    }
  }
  static async getAllRoles() {
    const connection = await pool.getConnection()
    try {
      const [rows] = await connection.query(`SELECT id, name FROM roles`)
      return rows
    } catch (error) {
      console.error('Error al obtener los roles', error)
      throw error
    } finally {
      connection.release()
    }
  }
}
module.exports = { SettingsModel }
