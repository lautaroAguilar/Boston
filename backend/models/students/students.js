const { pool } = require('../../config/database.js')

class StudentsModel {
  static async create(studentData) {
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      const [studentResult] = await connection.query(
        `INSERT INTO students (first_name, last_name, email, sid, initial_leveling_date, company_id, cost_center_id, sector_id, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          studentData.first_name,
          studentData.last_name,
          studentData.email,
          studentData.sid,
          studentData.initial_leveling_date,
          studentData.company_id,
          studentData.cost_center_id,
          studentData.sector_id,
          studentData.active !== undefined ? studentData.active : true
        ]
      )
      const studentId = studentResult.insertId

      // Insertar los idiomas del estudiante
      for (const language of studentData.languages) {
        await connection.query(
          `INSERT INTO StudentLanguages (studentId, languageId, createdAt, updatedAt) 
           VALUES (?, ?, NOW(), NOW())`,
          [studentId, language.language_id]
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
          s.active,
          c.id AS company_id,
          c.name AS company_name,
          cc.id AS cost_center_id,
          cc.name AS cost_center_name,
          sec.id AS sector_id,
          sec.name AS sector_name,
          GROUP_CONCAT(DISTINCT l.name) AS languages,
          sp.language_id AS current_language_id,
          sp.module_id AS current_module_id,
          lang.name AS current_language_name,
          m.name AS current_module_name,
          s.created_at,
          s.updated_at
        FROM students s
        JOIN company c ON s.company_id = c.id
        JOIN cost_center cc ON s.cost_center_id = cc.id
        JOIN sector sec ON s.sector_id = sec.id
        LEFT JOIN StudentLanguages sl ON s.id = sl.studentId
        LEFT JOIN languages l ON sl.languageId = l.id
        LEFT JOIN student_progress sp ON s.id = sp.student_id AND sp.is_current = 1
        LEFT JOIN languages lang ON sp.language_id = lang.id
        LEFT JOIN modules m ON sp.module_id = m.id
        WHERE 1=1
      `

      const params = []

      if (companyId) {
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
      // Consulta principal para obtener datos del estudiante
      const [student] = await connection.query(
        `SELECT 
          s.id AS student_id,
          s.first_name,
          s.last_name,
          s.email,
          s.initial_leveling_date,
          s.sid,
          s.active,
          c.name AS company_name,
          cc.name AS cost_center_name,
          sec.name AS sector_name,
          GROUP_CONCAT(DISTINCT l.name) AS languages,
          sp.language_id AS current_language_id,
          sp.module_id AS current_module_id,
          lang.name AS current_language_name,
          m.name AS current_module_name,
          s.created_at,
          s.updated_at
        FROM students s
        JOIN company c ON s.company_id = c.id
        JOIN cost_center cc ON s.cost_center_id = cc.id
        JOIN sector sec ON s.sector_id = sec.id
        LEFT JOIN StudentLanguages sl ON s.id = sl.studentId
        LEFT JOIN languages l ON sl.languageId = l.id
        LEFT JOIN student_progress sp ON s.id = sp.student_id AND sp.is_current = 1
        LEFT JOIN languages lang ON sp.language_id = lang.id
        LEFT JOIN modules m ON sp.module_id = m.id
        WHERE s.id = ?
        GROUP BY s.id`,
        [studentId]
      )
      
      // Si no se encuentra el estudiante, retornar null
      if (!student[0]) return null
      
      // Consulta para obtener todo el historial de progreso del estudiante
      const [progress] = await connection.query(
        `SELECT 
          sp.id,
          sp.language_id,
          l.name AS language_name,
          sp.module_id,
          m.name AS module_name,
          sp.start_date,
          sp.end_date,
          sp.is_current
        FROM student_progress sp
        JOIN languages l ON sp.language_id = l.id
        JOIN modules m ON sp.module_id = m.id
        WHERE sp.student_id = ?
        ORDER BY sp.start_date DESC`,
        [studentId]
      )
      
      // Consulta para obtener la información de CourseEnrollment
      const [enrollments] = await connection.query(
        `SELECT 
          ce.id,
          ce.languageId,
          l.name AS language_name,
          ce.moduleId,
          m.name AS module_name,
          ce.groupId,
          g.name AS group_name,
          t.firstName AS teacher_first_name,
          t.lastName AS teacher_last_name,
          ce.attendance,
          ce.averageScore,
          ce.status,
          ce.startDate,
          ce.endDate,
          ce.observations
        FROM CourseEnrollment ce
        JOIN languages l ON ce.languageId = l.id
        JOIN modules m ON ce.moduleId = m.id
        JOIN \`Group\` g ON ce.groupId = g.id
        LEFT JOIN Teacher t ON g.teacherId = t.id
        WHERE ce.studentId = ?
        ORDER BY ce.startDate DESC`,
        [studentId]
      )
      
      // Añadir el historial de progreso y enrollments al objeto estudiante
      return {
        ...student[0],
        progress: progress,
        enrollments: enrollments
      }
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
            `INSERT INTO StudentLanguages (studentId, languageId, createdAt, updatedAt) 
             VALUES (?, ?, NOW(), NOW())`,
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
