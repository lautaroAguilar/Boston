import { connect } from 'node:http2'
import { pool } from '../../config/database.js'

import { randomUUID } from 'node:crypto'

export class CompanyModel {
  static async create(companyData) {
    const connection = await pool.getConnection()
    const myUUID = randomUUID()
    try {
      await connection.beginTransaction()

      // Se inserta la empresa
      await connection.query(
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
          companyData.survey_link,
        ]
      )

      // Se insertan los sectores
      if (companyData.sectors && companyData.sectors.length > 0) {
        for (const sector of companyData.sectors) {
          await connection.query(
            `
            INSERT INTO SECTOR (company_id, name)
            VALUES (UUID_TO_BIN(?), ?)
          `,
            [myUUID, sector.name]
          )
        }
      }

      // Se insertan los centros de costo
      if (companyData.costCenters && companyData.costCenters.length > 0) {
        for (const cc of companyData.costCenters) {
          await connection.query(
            `
            INSERT INTO COST_CENTER (company_id, name)
            VALUES (UUID_TO_BIN(?), ?)
          `,
            [myUUID, cc.name]
          )
        }
      }

      // Se insertan los contactos
      if (companyData.contacts && companyData.contacts.length > 0) {
        for (const contact of companyData.contacts) {
          await connection.query(
            `
            INSERT INTO COMPANY_CONTACT (company_id, name, email, notes)
            VALUES (UUID_TO_BIN(?), ?, ?, ?)
          `,
            [myUUID, contact.name, contact.email, contact.notes]
          )
        }
      }

      await connection.commit()

      return {
        id: myUUID,
        ...companyData,
      }
    } catch (error) {
      console.log(error)
      await connection.rollback()
      throw new Error(`Hubo un error al crear la empresa `)
    } finally {
      connection.release()
    }
  }

  static async getAll() {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // Obtener todas las empresas
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

      // Trae los sectores
      const [sectors] = await connection.query(`
        SELECT
          s.id AS sector_id,
          BIN_TO_UUID(s.company_id) AS company_id,
          s.name AS sector_name
        FROM sector s
      `)

      // Trae los centros de costos
      const [costCenters] = await connection.query(`
        SELECT
          cc.id AS cc_id,
          BIN_TO_UUID(cc.company_id) AS company_id,
          cc.name AS cc_name
        FROM cost_center cc
      `)

      // Trae los contactos
      const [contacts] = await connection.query(`
        SELECT
          c.id AS contact_id,
          BIN_TO_UUID(c.company_id) AS company_id,
          c.name AS contact_name,
          c.email AS contact_email,
          c.notes AS contact_notes
        FROM company_contact c
      `)

      const mapCompanies = {}

      for (const comp of companies) {
        mapCompanies[comp.id] = {
          id: comp.id,
          name: comp.name,
          CUIT: comp.CUIT,
          business_name: comp.business_name,
          SID: comp.SID,
          survey_link: comp.survey_link,
          sectors: [],
          costCenters: [],
          contacts: [],
        }
      }

      // Se agrupan los sectores y se agregan a el map
      for (const sec of sectors) {
        const { company_id, sector_id, sector_name } = sec
        if (mapCompanies[company_id]) {
          mapCompanies[company_id].sectors.push({
            id: sector_id,
            name: sector_name,
          })
        }
      }

      // Se agrupan los centros de costo y se agregan a el map
      for (const cc of costCenters) {
        const { company_id, cc_id, cc_name } = cc
        if (mapCompanies[company_id]) {
          mapCompanies[company_id].costCenters.push({
            id: cc_id,
            name: cc_name,
          })
        }
      }

      // Se agrupan los contactos y se agregan a el map
      for (const ct of contacts) {
        const {
          company_id,
          contact_id,
          contact_name,
          contact_email,
          contact_notes,
        } = ct
        if (mapCompanies[company_id]) {
          mapCompanies[company_id].contacts.push({
            id: contact_id,
            name: contact_name,
            email: contact_email,
            notes: contact_notes,
          })
        }
      }

      await connection.commit()

      // Se convierte el map en un array y se devuelve
      const result = Object.values(mapCompanies)
      return result
    } catch (error) {
      await connection.rollback()
      throw new Error(`Hubo un error al buscar las empresas`)
    } finally {
      connection.release()
    }
  }

  static async getById(companyId) {
    const connection = await pool.getConnection()
    try {
      // 1. Obtener la empresa principal
      const [companyRows] = await connection.query(
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

      // Si no existe, retornamos null o podríamos lanzar un error
      if (companyRows.length === 0) {
        return null
      }

      const company = companyRows[0]

      // 2. Obtener los cost centers de la empresa
      const [costCentersRows] = await connection.query(
        `
        SELECT 
          cc.id,
          cc.name
        FROM cost_center cc
        WHERE cc.company_id = UUID_TO_BIN(?)
      `,
        [companyId]
      )

      // 3. Obtener los sectores de la empresa
      const [sectorsRows] = await connection.query(
        `
        SELECT 
          s.id,
          s.name
        FROM sector s
        WHERE s.company_id = UUID_TO_BIN(?)
      `,
        [companyId]
      )

      // 4. Obtener los contactos de la empresa
      const [contactsRows] = await connection.query(
        `
        SELECT
          co.id,
          co.name,
          co.email,
          co.notes
        FROM company_contact co
        WHERE co.company_id = UUID_TO_BIN(?)
      `,
        [companyId]
      )

      // 5. Construir un objeto unificado
      const result = {
        ...company, // Datos principales de la empresa
        costCenters: costCentersRows,
        sectors: sectorsRows,
        contacts: contactsRows,
      }

      return result
    } catch (error) {
      console.error('Error fetching company by ID:', error)
      throw new Error(`Hubo un error al buscar la empresa`)
    } finally {
      connection.release()
    }
  }
  static async deleteById(companyId) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // Ejecutamos el DELETE sobre la tabla principal
      const [result] = await connection.query(
        `DELETE FROM company WHERE id = UUID_TO_BIN(?)`,
        [companyId]
      )

      // Confirmamos la transacción
      await connection.commit()

      // result.affectedRows indica cuántas filas se borraron
      return result.affectedRows
    } catch (error) {
      // Revertir cambios si hubo error
      await connection.rollback()
      console.error('Error deleting company:', error)
      throw new Error(`Hubo un error al eliminar la empresa`)
    } finally {
      connection.release()
    }
  }
  static async updateById(id, data) {
    /* PENSAR CUAL SERÍA EL MEJOR ENFOQUE PARA MANEJAR ESTE MÉTODO 1 ENDPOINT O VARIOS PARA ACTUALIZAR LA EMPRESA. */
    const connection = await pool.getConnection()
    try {
      const [result] = await connection.query(`
      `)

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
