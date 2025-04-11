const { pool } = require('../../config/database.js')

class StudentsModel {
  static async create(studentData) {
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      const [studentResult] = await connection.query(
        `INSERT INTO students (first_name, last_name, email, sid, initial_leveling_date, company_id, cost_center_id, sector_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          studentData.first_name,
          studentData.last_name,
          studentData.email,
          studentData.sid,
          studentData.initial_leveling_date,
          studentData.company_id,
          studentData.cost_center_id,
          studentData.sector_id
        ]
      )
      const studentId = studentResult.insertId

      // Insertar los idiomas del estudiante
      for (const language of studentData.languages) {
        await connection.query(
          `INSERT INTO StudentLanguages (studentId, languageId, createdAt) 
           VALUES (?, ?, NOW())`,
          [studentId, language.language_id]
        )

        await connection.query(
          `INSERT INTO student_progress (student_id, language_id, module_id, start_date) 
           VALUES (?, ?, ?, CURDATE())`,
          [studentId, language.language_id, language.module_id]
        )
      }

      await connection.commit()
      return { id: studentId, ...studentData }
    } catch (err) {
      await connection.rollback()
      console.error('Error al crear el estudiante', err)
      throw err
    } finally {
      connection.release()
    }
  }
  static async getAll({ companyId }) {
    const connection = await pool.getConnection()
    try {
      let query = `
        SELECT 
          s.id AS student_id,
          s.first_name,
          s.last_name,
          s.email,
          s.initial_leveling_date,
          s.sid,
          c.id AS company_id,
          c.name AS company_name,
          cc.id AS cost_center_id,
          cc.name AS cost_center_name,
          sec.id AS sector_id,
          sec.name AS sector_name,
          GROUP_CONCAT(DISTINCT l.name) AS languages,
          s.created_at,
          s.updated_at
        FROM students s
        JOIN company c ON s.company_id = c.id
        JOIN cost_center cc ON s.cost_center_id = cc.id
        JOIN sector sec ON s.sector_id = sec.id
        LEFT JOIN StudentLanguages sl ON s.id = sl.studentId
        LEFT JOIN languages l ON sl.languageId = l.id
        WHERE 1=1
      `

      const params = []

      // Si hay companyId, filtramos por empresa
      if (companyId) {
        // Convertimos el ID a binario para comparar
        query += ` AND s.company_id = ?`
        params.push(companyId)
      }

      query += ` GROUP BY s.id ORDER BY s.id ASC`

      const [rows] = await connection.query(query, params)
      return rows
    } catch (err) {
      console.error('Error al obtener estudiantes', err)
      throw err
    } finally {
      connection.release()
    }
  }
  static async getById(studentId) {
    const connection = await pool.getConnection()
    try {
      const [student] = await connection.query(
        `SELECT 
          s.id AS student_id,
          s.first_name,
          s.last_name,
          s.email,
          s.initial_leveling_date,
          s.sid,
          c.name AS company_name,
          cc.name AS cost_center_name,
          sec.name AS sector_name,
          GROUP_CONCAT(DISTINCT l.name) AS languages,
          s.created_at,
          s.updated_at
        FROM students s
        JOIN company c ON s.company_id = c.id
        JOIN cost_center cc ON s.cost_center_id = cc.id
        JOIN sector sec ON s.sector_id = sec.id
        LEFT JOIN StudentLanguages sl ON s.id = sl.student_id
        LEFT JOIN languages l ON sl.languageId = l.id
        WHERE s.id = ?
        GROUP BY s.id`,
        [studentId]
      )
      return student[0]
    } catch (err) {
      console.error('Error al obtener el estudiante', err)
      throw err
    } finally {
      connection.release()
    }
  }
  static async deleteById(studentId) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // Eliminar registros relacionados primero
      await connection.query(
        `DELETE FROM StudentLanguages WHERE student_id = ?`,
        [studentId]
      )

      const [result] = await connection.query(
        `DELETE FROM students WHERE id = ?`,
        [studentId]
      )

      await connection.commit()
      return result.affectedRows
    } catch (err) {
      await connection.rollback()
      console.error('Error al eliminar el estudiante', err)
      throw err
    } finally {
      connection.release()
    }
  }
  static async updateById(studentId, studentData) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // Actualizar datos básicos del estudiante
      const clauses = Object.keys(studentData)
        .filter(key => !['languages'].includes(key))
        .map(key => `${key} = ?`)
        .join(', ')

      const values = Object.values(studentData)
        .filter((_, index) => !['languages'].includes(Object.keys(studentData)[index]))

      if (clauses) {
        await connection.query(
          `UPDATE students SET ${clauses} WHERE id = ?`,
          [...values, studentId]
        )
      }

      // Si hay idiomas para actualizar
      if (studentData.languages) {
        // Eliminar idiomas existentes
        await connection.query(
          `DELETE FROM StudentLanguages WHERE student_id = ?`,
          [studentId]
        )

        // Insertar nuevos idiomas
        for (const language of studentData.languages) {
          await connection.query(
            `INSERT INTO StudentLanguages (studentId, languageId, created_at) 
             VALUES (?, ?, NOW())`,
            [studentId, language.language_id]
          )
        }
      }

      await connection.commit()
      return 1 // Indicamos que se realizó la actualización
    } catch (err) {
      await connection.rollback()
      console.error('Error al actualizar el estudiante', err)
      throw err
    } finally {
      connection.release()
    }
  }
}
module.exports = { StudentsModel }
