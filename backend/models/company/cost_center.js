const { pool } = require('../../config/database.js')

class CostCenterModel {
  static async create(companyId, costCenterData, connection = null) {
    const conn = connection || (await pool.getConnection())
    try {
      if (!connection) await conn.beginTransaction()
      const result = await conn.query(
        `
            INSERT INTO cost_center (company_id, name)
            VALUES (?, ?)
          `,
        [companyId, costCenterData.name]
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
      console.error('Error detallado al crear centro de costo:', error)
      throw error // Propagamos el error original
    }
  }
  static async getAll(companyId) {
    const connection = await pool.getConnection()
    try {
      const result = await connection.query(
        `
            SELECT
              c.id AS cost_center_id,
              c.company_id AS company_id,
              c.name AS cost_center_name
            FROM cost_center c
            WHERE c.company_id = ?
          `,
        [companyId]
      )
      return result[0]
    } catch (error) {
      console.error('Error detallado al obtener centros de costo:', error)
      throw error
    } finally {
      connection.release()
    }
  }
  static async getById(costCenterId) {
    const connection = await pool.getConnection()
    try {
      const result = await connection.query(
        `
            SELECT
                c.id AS cost_center_id,
                c.company_id AS company_id,
                c.name AS cost_center_name
            FROM cost_center c
            WHERE c.id = ?
          `,
        [costCenterId]
      )
      return result[0]
    } catch (error) {
      console.error('Error detallado al obtener centro de costo por ID:', error)
      throw error
    } finally {
      connection.release()
    }
  }
  static async deleteById(costCenterId) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()
      const [result] = await connection.query(
        `DELETE FROM cost_center WHERE id = ?`,
        [costCenterId]
      )
      await connection.commit()
      return result.affectedRows
    } catch (error) {
      await connection.rollback()
      console.error('Error detallado al eliminar centro de costo:', error)
      throw error
    } finally {
      connection.release()
    }
  }
  static async updateById(costCenterId, costCenterData) {
    /* PENSAR CUAL SERÍA EL MEJOR ENFOQUE PARA MANEJAR ESTE MÉTODO 1 ENDPOINT O VARIOS PARA ACTUALIZAR LA EMPRESA. */
    const connection = await pool.getConnection()
    try {
      const setClauses = []
      const values = []

      if (costCenterData.name !== undefined) {
        setClauses.push('name = ?')
        values.push(costCenterData.name)
      }

      if (setClauses.length === 0) {
        return 0
      }

      const sql = `
          UPDATE cost_center
          SET ${setClauses.join(', ')}
          WHERE id = ?
        `
      values.push(costCenterId)
      const [result] = await connection.query(sql, values)

      await connection.commit()
      return result.affectedRows
    } catch (error) {
      await connection.rollback()
      console.error('Error detallado al actualizar centro de costo:', error)
      throw error
    } finally {
      connection.release()
    }
  }
}
module.exports = { CostCenterModel }
