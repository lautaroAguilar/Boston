import { pool } from '../../config/database.js'

export class SettingsModel {
  static async getAllModules() {
    const connection = await pool.getConnection()
    try {
      const [rows] = await connection.query(`SELECT id, name FROM modules`)
      return rows
    } catch (error) {
      throw new Error('Error al obtener módulos')
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
      throw new Error('Error al obtener idiomas')
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
      throw new Error('Error al obtener los roles')
    } finally {
      connection.release()
    }
  }
}
