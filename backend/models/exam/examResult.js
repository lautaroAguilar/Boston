const { pool } = require('../../config/database.js')

class ExamResultModel {
  static async create(examResultData) {
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      // Insertar resultado del examen
      const [result] = await connection.query(
        `INSERT INTO ExamResult (
          examId, studentId, score, feedback, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [
          examResultData.examId,
          examResultData.studentId,
          examResultData.score,
          examResultData.feedback || null
        ]
      )

      const examResultId = result.insertId

      // Obtener información del examen para saber a qué grupo pertenece
      const [examInfo] = await connection.query(
        `SELECT e.groupId FROM Exam e WHERE e.id = ?`,
        [examResultData.examId]
      )

      if (examInfo && examInfo.length > 0) {
        const groupId = examInfo[0].groupId

        // Actualizar el promedio de calificaciones en CourseEnrollment
        await this.updateAverageScore(connection, examResultData.studentId, groupId)
      }

      await connection.commit()
      return { id: examResultId, ...examResultData }
    } catch (err) {
      await connection.rollback()
      console.error('Error al crear resultado de examen', err)
      throw err
    } finally {
      connection.release()
    }
  }

  static async updateAverageScore(connection, studentId, groupId) {
    // Calcular el promedio de calificaciones del estudiante en este grupo
    const [scoreStats] = await connection.query(
      `SELECT AVG(er.score) as averageScore
       FROM ExamResult er
       JOIN Exam e ON er.examId = e.id
       WHERE e.groupId = ? AND er.studentId = ?`,
      [groupId, studentId]
    )

    if (scoreStats && scoreStats.length > 0 && scoreStats[0].averageScore !== null) {
      const averageScore = scoreStats[0].averageScore

      // Actualizar el promedio en CourseEnrollment
      await connection.query(
        `UPDATE CourseEnrollment 
         SET averageScore = ?, updatedAt = NOW() 
         WHERE studentId = ? AND groupId = ?`,
        [averageScore, studentId, groupId]
      )
    }
  }

  static async getByExamId(examId) {
    const connection = await pool.getConnection()
    try {
      const [results] = await connection.query(
        `SELECT 
          er.id, er.examId, er.studentId, er.score, er.feedback, er.createdAt, er.updatedAt,
          s.first_name, s.last_name, s.email
        FROM ExamResult er
        JOIN students s ON er.studentId = s.id
        WHERE er.examId = ?
        ORDER BY s.last_name, s.first_name`,
        [examId]
      )
      return results
    } catch (err) {
      console.error('Error al obtener resultados de examen', err)
      throw err
    } finally {
      connection.release()
    }
  }

  static async getByStudentId(studentId) {
    const connection = await pool.getConnection()
    try {
      const [results] = await connection.query(
        `SELECT 
          er.id, er.examId, er.studentId, er.score, er.feedback, er.createdAt, er.updatedAt,
          e.name as examName, e.date as examDate,
          g.id as groupId, g.name as groupName,
          l.name as languageName, m.name as moduleName
        FROM ExamResult er
        JOIN Exam e ON er.examId = e.id
        JOIN \`Group\` g ON e.groupId = g.id
        JOIN languages l ON g.languageId = l.id
        JOIN modules m ON g.moduleId = m.id
        WHERE er.studentId = ?
        ORDER BY e.date DESC`,
        [studentId]
      )
      return results
    } catch (err) {
      console.error('Error al obtener resultados de examen', err)
      throw err
    } finally {
      connection.release()
    }
  }

  static async update(examResultId, examResultData) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // Obtener la información actual para conocer el examId y studentId
      const [currentResult] = await connection.query(
        `SELECT er.examId, er.studentId, e.groupId 
         FROM ExamResult er
         JOIN Exam e ON er.examId = e.id
         WHERE er.id = ?`,
        [examResultId]
      )

      if (!currentResult || currentResult.length === 0) {
        throw new Error('No se encontró el resultado del examen')
      }

      // Actualizar el resultado del examen
      await connection.query(
        `UPDATE ExamResult 
         SET score = ?, feedback = ?, updatedAt = NOW() 
         WHERE id = ?`,
        [examResultData.score, examResultData.feedback || null, examResultId]
      )

      // Recalcular promedio
      await this.updateAverageScore(
        connection, 
        currentResult[0].studentId, 
        currentResult[0].groupId
      )

      await connection.commit()
      return { id: examResultId, ...examResultData }
    } catch (err) {
      await connection.rollback()
      console.error('Error al actualizar resultado de examen', err)
      throw err
    } finally {
      connection.release()
    }
  }

  static async delete(examResultId) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // Obtener la información actual para conocer el examId y studentId
      const [currentResult] = await connection.query(
        `SELECT er.examId, er.studentId, e.groupId 
         FROM ExamResult er
         JOIN Exam e ON er.examId = e.id
         WHERE er.id = ?`,
        [examResultId]
      )

      if (!currentResult || currentResult.length === 0) {
        throw new Error('No se encontró el resultado del examen')
      }

      // Eliminar el registro
      await connection.query(
        `DELETE FROM ExamResult WHERE id = ?`,
        [examResultId]
      )

      // Recalcular promedio
      await this.updateAverageScore(
        connection, 
        currentResult[0].studentId, 
        currentResult[0].groupId
      )

      await connection.commit()
      return { id: examResultId }
    } catch (err) {
      await connection.rollback()
      console.error('Error al eliminar resultado de examen', err)
      throw err
    } finally {
      connection.release()
    }
  }

  static async bulkCreate(examResultsDataList) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      const results = []
      let groupId = null
      let examId = null
      
      if (examResultsDataList.length > 0) {
        examId = examResultsDataList[0].examId
      }

      // Obtener el groupId para todos los resultados (asumiendo que todos son del mismo examen)
      if (examId) {
        const [examInfo] = await connection.query(
          `SELECT e.groupId FROM Exam e WHERE e.id = ?`,
          [examId]
        )
        
        if (examInfo && examInfo.length > 0) {
          groupId = examInfo[0].groupId
        }
      }

      for (const examResultData of examResultsDataList) {
        // Insertar resultado del examen
        const [result] = await connection.query(
          `INSERT INTO ExamResult (
            examId, studentId, score, feedback, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, NOW(), NOW())`,
          [
            examResultData.examId,
            examResultData.studentId,
            examResultData.score,
            examResultData.feedback || null
          ]
        )

        results.push({
          id: result.insertId,
          ...examResultData
        })

        // Actualizar el promedio en CourseEnrollment
        if (groupId) {
          await this.updateAverageScore(connection, examResultData.studentId, groupId)
        }
      }

      await connection.commit()
      return results
    } catch (err) {
      await connection.rollback()
      console.error('Error al crear resultados de examen en masa', err)
      throw err
    } finally {
      connection.release()
    }
  }
}

module.exports = { ExamResultModel } 