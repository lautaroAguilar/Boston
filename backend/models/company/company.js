import { pool } from '../../config/database.js'
import { ContactsModel } from './contacts.js'
import { CostCenterModel } from './cost_center.js'
import { SectorModel } from './sector.js'

import { randomUUID } from 'node:crypto'

export class CompanyModel {
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
      throw new Error(
        `Hubo un error al crear la empresa`
      )
    }
  }
  static async create(companyData, connection = null) {
    const conn = connection || (await pool.getConnection())
    const myUUID = randomUUID()
    try {
      if (!connection) await conn.beginTransaction()

      // Se inserta la empresa
      await conn.query(
        `
        INSERT INTO COMPANY (id, name, CUIT, business_name, SID, survey_link)
        VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?)
      `,
        [
          myUUID,
          companyData.name,
          companyData.cuit,
          companyData.business_name,
          companyData.sid,
          companyData.survey_link
        ]
      )
      if (!connection) {
        await conn.commit()
        conn.release()
      }
      return {
        id: myUUID,
        ...companyData
      }
    } catch (error) {
      if (!connection) {
        await conn.rollback()
        conn.release()
      }
      throw new Error(`Hubo un error al crear la empresa `)
    }
  }

  static async getAll() {
    const connection = await pool.getConnection()
    try {
      const [companies] = await connection.query(`
        SELECT 
          BIN_TO_UUID(id) AS id,
          name,
          CUIT,
          business_name,
          SID,
          survey_link
        FROM company
      `)
      return companies
    } catch (error) {
      throw new Error(`Hubo un error al buscar las empresas`)
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
          BIN_TO_UUID(c.id) AS id,
          c.name,
          c.CUIT,
          c.business_name,
          c.SID,
          c.survey_link
        FROM company c
        WHERE c.id = UUID_TO_BIN(?)
      `,
        [companyId]
      )

      if (company.length === 0) {
        return null
      }
      return company[0]
    } catch (error) {
      console.error('Error al buscar la empresa por ID:', error)
      throw new Error(`Hubo un error al buscar la empresa`)
    } finally {
      connection.release()
    }
  }
  static async deleteById(companyId) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()
      const [result] = await connection.query(
        `DELETE FROM company WHERE id = UUID_TO_BIN(?)`,
        [companyId]
      )
      await connection.commit()
      return result.affectedRows
    } catch (error) {
      await connection.rollback()
      console.error('Error deleting company:', error)
      throw new Error(`Hubo un error al eliminar la empresa`)
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
        setClauses.push('CUIT = ?')
        values.push(companyData.cuit)
      }
      if (companyData.business_name !== undefined) {
        setClauses.push('business_name = ?')
        values.push(companyData.business_name)
      }
      if (companyData.sid !== undefined) {
        setClauses.push('SID = ?')
        values.push(companyData.sid)
      }
      if (companyData.survey_link !== undefined) {
        setClauses.push('survey_link = ?')
        values.push(companyData.survey_link)
      }
      if (setClauses.length === 0) {
        return 0
      }
      const sql = `
          UPDATE company
          SET ${setClauses.join(', ')}
          WHERE id = UUID_TO_BIN(?)
        `
      values.push(companyId)
      const [result] = await connection.query(sql, values)
      await connection.commit()
      return result.affectedRows
    } catch (error) {
      await connection.rollback()
      console.error('Error updating company', error)
      throw new Error('Hubo un error al actualizar la empresa')
    } finally {
      connection.release()
    }
  }
}
