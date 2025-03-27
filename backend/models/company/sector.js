const { pool } = require('../../config/database.js')

class SectorModel {
  static async create(companyId, sectorData, connection = null) {
    const conn = connection || (await pool.getConnection())
    try {
      if (!connection) await conn.beginTransaction()

      const result = await conn.query(
        `
            INSERT INTO sector (company_id, name)
            VALUES (?, ?)
          `,
        [companyId, sectorData.name]
      )
      if (!connection) {
        await conn.commit()
        conn.release()
      }
      return result[0]
    } catch (error) {
      if (!connection) {
        await conn.rollback()
        conn.release()
      }
      console.error('Error detallado al crear sector:', error)
      throw error // Propagamos el error original
    }
  }
  static async getAll(companyId) {
    const connection = await pool.getConnection()
    try {
      const result = await connection.query(
        `
            SELECT
                s.id AS sector_id,
                s.company_id AS company_id,
                s.name AS sector_name
            FROM sector s
            WHERE s.company_id = ?
          `,
        [companyId]
      )
      return result[0]
    } catch (error) {
      console.error('Error detallado al obtener sectores:', error)
      throw error
    } finally {
      connection.release()
    }
  }
  static async getById(sectorId) {
    const connection = await pool.getConnection()
    try {
      const result = await connection.query(
        `
            SELECT
                s.id AS sector_id,
                s.company_id AS company_id,
                s.name AS sector_name
            FROM sector s
            WHERE s.id = ?
          `,
        [sectorId]
      )
      return result[0]
    } catch (error) {
      console.error('Error detallado al obtener sector por ID:', error)
      throw error
    } finally {
      connection.release()
    }
  }
  static async deleteById(sectorId) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()
      const [result] = await connection.query(
        `DELETE FROM sector WHERE id = ?`,
        [sectorId]
      )
      await connection.commit()
      return result.affectedRows
    } catch (error) {
      await connection.rollback()
      console.error('Error detallado al eliminar sector:', error)
      throw error
    } finally {
      connection.release()
    }
  }
  static async updateById(sectorId, sectorData) {
    const connection = await pool.getConnection()
    try {
      const setClauses = []
      const values = []

      if (sectorData.name !== undefined) {
        setClauses.push('name = ?')
        values.push(sectorData.name)
      }

      if (setClauses.length === 0) {
        return 0
      }

      const sql = `
          UPDATE sector
          SET ${setClauses.join(', ')}
          WHERE id = ?
        `
      values.push(sectorId)
      const [result] = await connection.query(sql, values)

      await connection.commit()
      return result.affectedRows
    } catch (error) {
      await connection.rollback()
      console.error('Error detallado al actualizar sector:', error)
      throw error
    } finally {
      connection.release()
    }
  }
}
module.exports = { SectorModel }
