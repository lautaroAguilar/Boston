const { pool } = require('../../config/database.js')

class CostCenterModel {
  static async create(companyId, costCenterData, connection = null) {
    const conn = connection || (await pool.getConnection())
    try {
      if (!connection) await conn.beginTransaction()
      const result = await conn.query(
        `
            INSERT INTO cost_center (company_id, name)
            VALUES (UUID_TO_BIN(?), ?)
          `,
        [companyId, costCenterData.name]
      )
      if (!connection) {
        await conn.commit()
        conn.release()
      }
      return result[0]
    } catch (error) {
      console.log('Error al crear los centros de costo', error)
      if (!connection) {
        await conn.rollback()
        conn.release()
      }
      throw new Error(
        'Hubo un error al crear los centros de costo de la empresa'
      )
    }
  }
  static async getAll(companyId) {
    const connection = await pool.getConnection()
    try {
      const result = await connection.query(
        `
            SELECT
              c.id AS cost_center_id,
              BIN_TO_UUID(c.company_id) AS company_id,
              c.name AS cost_center_name
            FROM cost_center c
            WHERE BIN_TO_UUID(c.company_id) = ?
          `,
        [companyId]
      )
      return result[0]
    } catch (error) {
      console.log('Error al obtener los centros de costo', error)
      throw new Error(
        'Hubo un error al buscar los centros de costo de la empresa'
      )
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
                BIN_TO_UUID(c.company_id) AS company_id,
                c.name AS cost_center_name
            FROM cost_center c
            WHERE c.id = ?
          `,
        [costCenterId]
      )
      return result[0]
    } catch (error) {
      console.log('Error al obtener el centro de costo', error)
      throw new Error(
        'Hubo un error al buscar el centro de costo de la empresa'
      )
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
      console.log('Error al eliminar el centro de costo', error)
      throw new Error(
        'Hubo un error al eliminar el centro de costo de la empresa'
      )
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
      console.error('Error actualizando el centro de costo', error)
      throw new Error('Hubo un error al el centro de costo de la empresa')
    } finally {
      connection.release()
    }
  }
}
module.exports = { CostCenterModel }
