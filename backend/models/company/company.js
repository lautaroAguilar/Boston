const { pool } = require('../../config/database.js')
const { ContactsModel } = require('./contacts.js')
const { CostCenterModel } = require('./cost_center.js')
const { SectorModel } = require('./sector.js')

class CompanyModel {
  static async createWithRelations(
    companyData,
    contactData,
    costCenterData,
    sectorData
  ) {
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      // 🔹 Reutilizamos el método `create()`, pasándole la conexión
      const newCompany = await CompanyModel.create(companyData, connection)
      const newCompanyId = newCompany.id

      // Crear entidades relacionadas
      await ContactsModel.create(newCompanyId, contactData, connection)
      await CostCenterModel.create(newCompanyId, costCenterData, connection)
      await SectorModel.create(newCompanyId, sectorData, connection)

      await connection.commit()
      connection.release()

      return newCompany
    } catch (error) {
      await connection.rollback()
      connection.release()
      console.error('Error detallado al crear empresa y relaciones:', error)
      throw error
    }
  }

  static async create(companyData, connection = null) {
    const conn = connection || (await pool.getConnection())
    try {
      if (!connection) await conn.beginTransaction()

      // Se inserta la empresa
      const [result] = await conn.query(
        `
        INSERT INTO company (name, cuit, business_name, first_survey_link, second_survey_link, active)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
        [
          companyData.name,
          companyData.cuit,
          companyData.business_name,
          companyData.first_survey_link,
          companyData.second_survey_link,
          companyData.active !== undefined ? companyData.active : true
        ]
      )

      if (!connection) {
        await conn.commit()
        conn.release()
      }

      return {
        id: result.insertId,
        ...companyData
      }
    } catch (error) {
      if (!connection) {
        await conn.rollback()
        conn.release()
      }
      console.error('Error detallado al crear empresa:', error)
      throw error
    }
  }

  static async getAll() {
    const connection = await pool.getConnection()
    try {
      const [companies] = await connection.query(`
        SELECT 
          id,
          name,
          cuit,
          business_name,
          first_survey_link,
          second_survey_link,
          active
        FROM company
      `)
      return companies
    } catch (error) {
      console.error(`Hubo un error al buscar las empresas`, error)
      throw error
    } finally {
      connection.release()
    }
  }

  static async getById(companyId) {
    const connection = await pool.getConnection()
    try {
      const [company] = await connection.query(
        `
        SELECT 
          c.id,
          c.name,
          c.cuit,
          c.business_name,
          c.first_survey_link,
          c.second_survey_link,
          c.active
        FROM company c
        WHERE c.id = ?
      `,
        [companyId]
      )

      if (company.length === 0) {
        return null
      }
      return company[0]
    } catch (error) {
      console.error('Error al buscar la empresa por ID:', error)
      throw error
    } finally {
      connection.release()
    }
  }

  static async deleteById(companyId) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()
      const [result] = await connection.query(
        `DELETE FROM company WHERE id = ?`,
        [companyId]
      )
      await connection.commit()
      return result.affectedRows
    } catch (error) {
      await connection.rollback()
      console.error('Error deleting company:', error)
      throw error
    } finally {
      connection.release()
    }
  }

  static async updateById(companyId, companyData) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()
      /* creamos dinámicamente las clausulas y asignamos los valores para el update */
      const setClauses = []
      const values = []
      if (companyData.name !== undefined) {
        setClauses.push('name = ?')
        values.push(companyData.name)
      }
      if (companyData.cuit !== undefined) {
        setClauses.push('cuit = ?')
        values.push(companyData.cuit)
      }
      if (companyData.business_name !== undefined) {
        setClauses.push('business_name = ?')
        values.push(companyData.business_name)
      }
      if (companyData.first_survey_link !== undefined) {
        setClauses.push('first_survey_link = ?')
        values.push(companyData.first_survey_link)
      }
      if (companyData.second_survey_link !== undefined) {
        setClauses.push('second_survey_link = ?')
        values.push(companyData.second_survey_link)
      }
      if (companyData.active !== undefined) {
        setClauses.push('active = ?')
        values.push(companyData.active)
      }
      if (setClauses.length === 0) {
        return 0
      }
      const sql = `
          UPDATE company
          SET ${setClauses.join(', ')}
          WHERE id = ?
        `
      values.push(companyId)
      const [result] = await connection.query(sql, values)
      await connection.commit()
      return result.affectedRows
    } catch (error) {
      await connection.rollback()
      console.error('Error al actualizar la empresa', error)
      throw error
    } finally {
      connection.release()
    }
  }
}

module.exports = { CompanyModel }
