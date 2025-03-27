const { pool } = require('../../config/database.js')

class ContactsModel {
  static async create(companyId, contactsData, connection = null) {
    const conn = connection || (await pool.getConnection())
    try {
      if (!connection) await conn.beginTransaction()
      const result = await conn.query(
        `
            INSERT INTO company_contact (company_id, name, email, notes)
            VALUES (UUID_TO_BIN(?), ?, ?, ?)
          `,
        [companyId, contactsData.name, contactsData.email, contactsData.notes]
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
      console.error('Error detallado al crear contacto:', error)
      throw error // Propagamos el error original
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
      console.error('Error detallado al obtener contactos:', error)
      throw error
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
      console.error('Error detallado al obtener contacto por ID:', error)
      throw error
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
      console.error('Error detallado al eliminar contacto:', error)
      throw error
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
      console.error('Error detallado al actualizar contacto:', error)
      throw error
    } finally {
      connection.release()
    }
  }
}

module.exports = { ContactsModel }
