const { pool } = require('../../config/database.js')

class CourseEnrollmentModel {
  static async getByStudentId(studentId) {
    const connection = await pool.getConnection()
    try {
      const [enrollments] = await connection.query(
        `SELECT 
          ce.id,
          ce.studentId,
          ce.groupId,
          g.name AS group_name,
          ce.languageId,
          l.name AS language_name,
          ce.moduleId,
          m.name AS module_name,
          t.id AS teacher_id,
          t.firstName AS teacher_first_name,
          t.lastName AS teacher_last_name,
          ce.attendance,
          ce.averageScore,
          ce.status,
          ce.startDate,
          ce.endDate,
          ce.observations,
          ce.createdAt,
          ce.updatedAt
        FROM CourseEnrollment ce
        JOIN languages l ON ce.languageId = l.id
        JOIN modules m ON ce.moduleId = m.id
        JOIN \`Group\` g ON ce.groupId = g.id
        LEFT JOIN Teacher t ON g.teacherId = t.id
        WHERE ce.studentId = ?
        ORDER BY ce.startDate DESC`,
        [studentId]
      )
      return enrollments
    } catch (err) {
      console.error('Error al obtener inscripciones', err)
      throw err
    } finally {
      connection.release()
    }
  }

  static async getById(enrollmentId) {
    const connection = await pool.getConnection()
    try {
      const [enrollments] = await connection.query(
        `SELECT 
          ce.id,
          ce.studentId,
          ce.groupId,
          g.name AS group_name,
          ce.languageId,
          l.name AS language_name,
          ce.moduleId,
          m.name AS module_name,
          t.id AS teacher_id,
          t.firstName AS teacher_first_name,
          t.lastName AS teacher_last_name,
          ce.attendance,
          ce.averageScore,
          ce.status,
          ce.startDate,
          ce.endDate,
          ce.observations,
          ce.createdAt,
          ce.updatedAt
        FROM CourseEnrollment ce
        JOIN languages l ON ce.languageId = l.id
        JOIN modules m ON ce.moduleId = m.id
        JOIN \`Group\` g ON ce.groupId = g.id
        LEFT JOIN Teacher t ON g.teacherId = t.id
        WHERE ce.id = ?`,
        [enrollmentId]
      )
      return enrollments[0] || null
    } catch (err) {
      console.error('Error al obtener la inscripción', err)
      throw err
    } finally {
      connection.release()
    }
  }

  static async updateById(enrollmentId, enrollmentData) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // Preparar campos a actualizar
      const fields = []
      const values = []

      // Añadir campos que se pueden actualizar
      if (enrollmentData.groupId !== undefined) {
        fields.push('groupId = ?')
        values.push(enrollmentData.groupId)
      }
      if (enrollmentData.moduleId !== undefined) {
        fields.push('moduleId = ?')
        values.push(enrollmentData.moduleId)
      }
      if (enrollmentData.attendance !== undefined) {
        fields.push('attendance = ?')
        values.push(enrollmentData.attendance)
      }
      if (enrollmentData.averageScore !== undefined) {
        fields.push('averageScore = ?')
        values.push(enrollmentData.averageScore)
      }
      if (enrollmentData.status !== undefined) {
        fields.push('status = ?')
        values.push(enrollmentData.status)
      }
      if (enrollmentData.endDate !== undefined) {
        fields.push('endDate = ?')
        values.push(enrollmentData.endDate)
      }
      if (enrollmentData.observations !== undefined) {
        fields.push('observations = ?')
        values.push(enrollmentData.observations)
      }

      // Si no hay campos para actualizar, retornar 0
      if (fields.length === 0) return 0

      // Añadir el ID al final de los valores
      values.push(enrollmentId)

      // Actualizar la inscripción
      const [result] = await connection.query(
        `UPDATE CourseEnrollment SET ${fields.join(', ')} WHERE id = ?`,
        values
      )

      // Si se cambia el estado a "completed", actualizar también student_progress
      if (enrollmentData.status === 'completed') {
        // Primero obtener los datos de la inscripción
        const [enrollment] = await connection.query(
          `SELECT studentId, languageId FROM CourseEnrollment WHERE id = ?`,
          [enrollmentId]
        )
        
        if (enrollment.length > 0) {
          // Actualizar el registro de progreso correspondiente
          await connection.query(
            `UPDATE student_progress 
             SET end_date = ?, is_current = 0 
             WHERE student_id = ? AND language_id = ? AND is_current = 1`,
            [
              enrollmentData.endDate || new Date(),
              enrollment[0].studentId,
              enrollment[0].languageId
            ]
          )
        }
      }

      await connection.commit()
      return result.affectedRows
    } catch (err) {
      await connection.rollback()
      console.error('Error al actualizar la inscripción', err)
      throw err
    } finally {
      connection.release()
    }
  }

  static async deleteById(enrollmentId) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // Eliminar la inscripción
      const [result] = await connection.query(
        `DELETE FROM CourseEnrollment WHERE id = ?`,
        [enrollmentId]
      )

      await connection.commit()
      return result.affectedRows
    } catch (err) {
      await connection.rollback()
      console.error('Error al eliminar la inscripción', err)
      throw err
    } finally {
      connection.release()
    }
  }
}

module.exports = { CourseEnrollmentModel } 