import { pool } from '../../config/database.js'

export class ContactsModel {
  static async create(companyId, contactsData) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()
      const result = await connection.query(
        `
            INSERT INTO company_contact (company_id, name, email, notes)
            VALUES (UUID_TO_BIN(?), ?, ?, ?)
          `,
        [companyId, contactsData.name, contactsData.email, contactsData.notes]
      )
      await connection.commit()
      return result[0]
    } catch (error) {
      await connection.rollback()
      console.log('Error al crear los contactos', error)
      throw new Error('Hubo un error al crear los contactos de la empresa')
    } finally {
      connection.release()
    }
  }
  static async getAll(companyId) {
    const connection = await pool.getConnection()
    try {
      const result = await connection.query(
        `
            SELECT
                c.id AS contact_id,
                BIN_TO_UUID(c.company_id) AS company_id,
                c.name AS contact_name,
                c.email AS contact_email,
                c.notes AS contact_notes
            FROM company_contact c
            WHERE BIN_TO_UUID(c.company_id) = ?
          `,
        [companyId]
      )
      return result[0]
    } catch (error) {
      console.log('Error al obtener los contactos', error)
      throw new Error('Hubo un error al buscar los contactos de las empresas')
    } finally {
      connection.release()
    }
  }
  static async getById(contactId) {
    const connection = await pool.getConnection()
    try {
      const result = await connection.query(
        `
            SELECT
                c.id AS contact_id,
                BIN_TO_UUID(c.company_id) AS company_id,
                c.name AS contact_name,
                c.email AS contact_email,
                c.notes AS contact_notes
            FROM company_contact c
            WHERE c.id = ?
          `,
        [contactId]
      )
      return result[0]
    } catch (error) {
      console.log('Error al obtener el contacto', error)
      throw new Error('Hubo un error al buscar el contacto de la empresa')
    } finally {
      connection.release()
    }
  }
  static async deleteById(contactId) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()
      const [result] = await connection.query(
        `DELETE FROM company_contact WHERE id = ?`,
        [contactId]
      )
      await connection.commit()
      return result.affectedRows
    } catch (error) {
      await connection.rollback()
      console.log('Error al eliminar el contacto', error)
      throw new Error('Hubo un error al buscar los contactos de las empresas')
    } finally {
      connection.release()
    }
  }
  static async updateById(contactId, contactData) {
    const connection = await pool.getConnection()
    try {
      const setClauses = []
      const values = []

      if (contactData.name !== undefined) {
        setClauses.push('name = ?')
        values.push(contactData.name)
      }
      if (contactData.email !== undefined) {
        setClauses.push('email = ?')
        values.push(contactData.email)
      }
      if (contactData.notes !== undefined) {
        setClauses.push('notes = ?')
        values.push(contactData.notes)
      }

      if (setClauses.length === 0) {
        return 0
      }

      const sql = `
          UPDATE company_contact
          SET ${setClauses.join(', ')}
          WHERE id = ?
        `
      values.push(contactId)
      const [result] = await connection.query(sql, values)

      await connection.commit()
      return result.affectedRows
    } catch (error) {
      await connection.rollback()
      console.error('Error actualizando el contacto de la empresa', error)
      throw new Error('Hubo un error al actualizar el contacto de la empresa')
    } finally {
      connection.release()
    }
  }
}
