const { pool } = require('../../config/database.js')

class AttendanceModel {
  static async create(attendanceData) {
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      // Insertar registro de asistencia
      const [result] = await connection.query(
        `INSERT INTO Attendance (
          classId, studentId, status, date, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [
          attendanceData.classId,
          attendanceData.studentId,
          attendanceData.status,
          attendanceData.date || new Date()
        ]
      )

      const attendanceId = result.insertId

      // Obtener información de la clase para saber a qué grupo pertenece
      const [classInfo] = await connection.query(
        `SELECT c.groupId FROM Class c WHERE c.id = ?`,
        [attendanceData.classId]
      )

      if (classInfo && classInfo.length > 0) {
        const groupId = classInfo[0].groupId

        // Calcular porcentaje de asistencia actualizado para este estudiante en este grupo
        await this.updateAttendancePercentage(connection, attendanceData.studentId, groupId)
      }

      await connection.commit()
      return { id: attendanceId, ...attendanceData }
    } catch (err) {
      await connection.rollback()
      console.error('Error al crear registro de asistencia', err)
      throw err
    } finally {
      connection.release()
    }
  }

  static async updateAttendancePercentage(connection, studentId, groupId) {
    // Calcular el porcentaje de asistencia del estudiante en este grupo
    const [attendanceStats] = await connection.query(
      `SELECT 
        COUNT(*) as totalClasses,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as presentCount
      FROM Attendance a
      JOIN Class c ON a.classId = c.id
      WHERE c.groupId = ? AND a.studentId = ?`,
      [groupId, studentId]
    )

    if (attendanceStats && attendanceStats.length > 0 && attendanceStats[0].totalClasses > 0) {
      const totalClasses = attendanceStats[0].totalClasses
      const presentCount = attendanceStats[0].presentCount
      const attendancePercentage = (presentCount / totalClasses) * 100

      // Actualizar el porcentaje en CourseEnrollment
      await connection.query(
        `UPDATE CourseEnrollment 
         SET attendance = ?, updatedAt = NOW() 
         WHERE studentId = ? AND groupId = ?`,
        [attendancePercentage, studentId, groupId]
      )
    }
  }

  static async getByClassId(classId) {
    const connection = await pool.getConnection()
    try {
      const [attendanceList] = await connection.query(
        `SELECT 
          a.id, a.classId, a.studentId, a.status, a.date,
          s.first_name, s.last_name, s.email
        FROM Attendance a
        JOIN students s ON a.studentId = s.id
        WHERE a.classId = ?
        ORDER BY s.last_name, s.first_name`,
        [classId]
      )
      return attendanceList
    } catch (err) {
      console.error('Error al obtener asistencias', err)
      throw err
    } finally {
      connection.release()
    }
  }

  static async getByStudentId(studentId) {
    const connection = await pool.getConnection()
    try {
      const [attendanceList] = await connection.query(
        `SELECT 
          a.id, a.classId, a.studentId, a.status, a.date,
          c.groupId, g.name as groupName,
          cl.date as classDate, cl.startTime, cl.endTime
        FROM Attendance a
        JOIN Class c ON a.classId = c.id
        JOIN \`Group\` g ON c.groupId = g.id
        JOIN Class cl ON a.classId = cl.id
        WHERE a.studentId = ?
        ORDER BY a.date DESC, cl.startTime DESC`,
        [studentId]
      )
      return attendanceList
    } catch (err) {
      console.error('Error al obtener asistencias', err)
      throw err
    } finally {
      connection.release()
    }
  }

  static async update(attendanceId, attendanceData) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // Obtener la información actual de asistencia para conocer el classId y studentId
      const [currentAttendance] = await connection.query(
        `SELECT a.classId, a.studentId, c.groupId 
         FROM Attendance a
         JOIN Class c ON a.classId = c.id
         WHERE a.id = ?`,
        [attendanceId]
      )

      if (!currentAttendance || currentAttendance.length === 0) {
        throw new Error('No se encontró el registro de asistencia')
      }

      // Actualizar el registro de asistencia
      await connection.query(
        `UPDATE Attendance 
         SET status = ?, updatedAt = NOW() 
         WHERE id = ?`,
        [attendanceData.status, attendanceId]
      )

      // Recalcular porcentaje de asistencia
      await this.updateAttendancePercentage(
        connection, 
        currentAttendance[0].studentId, 
        currentAttendance[0].groupId
      )

      await connection.commit()
      return { id: attendanceId, ...attendanceData }
    } catch (err) {
      await connection.rollback()
      console.error('Error al actualizar registro de asistencia', err)
      throw err
    } finally {
      connection.release()
    }
  }

  static async delete(attendanceId) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      // Obtener la información actual de asistencia para conocer el classId y studentId
      const [currentAttendance] = await connection.query(
        `SELECT a.classId, a.studentId, c.groupId 
         FROM Attendance a
         JOIN Class c ON a.classId = c.id
         WHERE a.id = ?`,
        [attendanceId]
      )

      if (!currentAttendance || currentAttendance.length === 0) {
        throw new Error('No se encontró el registro de asistencia')
      }

      // Eliminar el registro
      await connection.query(
        `DELETE FROM Attendance WHERE id = ?`,
        [attendanceId]
      )

      // Recalcular porcentaje de asistencia
      await this.updateAttendancePercentage(
        connection, 
        currentAttendance[0].studentId, 
        currentAttendance[0].groupId
      )

      await connection.commit()
      return { id: attendanceId }
    } catch (err) {
      await connection.rollback()
      console.error('Error al eliminar registro de asistencia', err)
      throw err
    } finally {
      connection.release()
    }
  }

  static async bulkCreate(attendanceDataList) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      const results = []
      let groupId = null

      for (const attendanceData of attendanceDataList) {
        // Insertar registro de asistencia
        const [result] = await connection.query(
          `INSERT INTO Attendance (
            classId, studentId, status, date, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, NOW(), NOW())`,
          [
            attendanceData.classId,
            attendanceData.studentId,
            attendanceData.status,
            attendanceData.date || new Date()
          ]
        )

        results.push({
          id: result.insertId,
          ...attendanceData
        })

        // Si aún no tenemos el groupId, obtenerlo
        if (!groupId) {
          const [classInfo] = await connection.query(
            `SELECT c.groupId FROM Class c WHERE c.id = ?`,
            [attendanceData.classId]
          )
          
          if (classInfo && classInfo.length > 0) {
            groupId = classInfo[0].groupId
          }
        }

        // Recalcular el porcentaje de asistencia
        if (groupId) {
          await this.updateAttendancePercentage(connection, attendanceData.studentId, groupId)
        }
      }

      await connection.commit()
      return results
    } catch (err) {
      await connection.rollback()
      console.error('Error al crear asistencias en masa', err)
      throw err
    } finally {
      connection.release()
    }
  }
}

module.exports = { AttendanceModel } 