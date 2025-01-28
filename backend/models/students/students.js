import { pool } from '../../config/database.js'

export class StudentsModel {
  static async create(studentData) {
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      const [studentResult] = await connection.query(
        `INSERT INTO students (first_name, last_name, email, initial_leveling_date, company_id, cost_center_id, sector_id) VALUES (?, ?, ?, ?, UUID_TO_BIN(?), ?, ?)`,
        [
          studentData.first_name,
          studentData.last_name,
          studentData.email,
          studentData.initial_leveling_date,
          studentData.company_id,
          studentData.cost_center_id,
          studentData.sector_id
        ]
      )
      const studentId = studentResult.insertId

      await connection.query(
        `INSERT INTO student_progress (student_id, language_id, module_id, level_id, start_date) 
         VALUES (?, ?, ?, ?, CURDATE())`,
        [
          studentId,
          studentData.language_id,
          studentData.module_id,
          studentData.level_id
        ]
      )

      await connection.commit()
      return { id: studentId, ...studentData }
    } catch (err) {
      await connection.rollback()
      console.log(err)
      throw new Error('Error al crear el estudiante')
    } finally {
      connection.release()
    }
  }
  static async getAll() {
    const connection = await pool.getConnection()
    try {
      const [students] = await connection.query(
        `SELECT 
          s.id AS student_id,
          s.first_name,
          s.last_name,
          s.email,
          s.initial_leveling_date,
          c.name AS company_name,
          cc.name AS cost_center_name,
          sec.name AS sector_name,
          s.created_at,
          s.updated_at
        FROM students s
        JOIN company c ON s.company_id = c.id
        JOIN cost_center cc ON s.cost_center_id = cc.id
        JOIN sector sec ON s.sector_id = sec.id
        ORDER BY s.id`
      )
      return students
    } catch (err) {
      console.log(err)
      throw new Error('Error al obtener estudiantes')
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
          c.name AS company_name,
          cc.name AS cost_center_name,
          sec.name AS sector_name,
          s.created_at,
          s.updated_at
        FROM students s
        JOIN company c ON s.company_id = c.id
        JOIN cost_center cc ON s.cost_center_id = cc.id
        JOIN sector sec ON s.sector_id = sec.id
        WHERE s.id = ?`,
        [studentId]
      )
      return student[0]
    } catch (err) {
      console.log(err)
      throw new Error('Error al obtener el estudiante')
    } finally {
      connection.release()
    }
  }
  static async deleteById(studentId) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()

      const [result] = await connection.query(
        `DELETE FROM students WHERE id = ?`,
        [studentId]
      )

      await connection.commit()
      return result.affectedRows
    } catch (err) {
      console.log(err)
      await connection.rollback()
      throw new Error('Error al eliminar el estudiante')
    } finally {
      connection.release()
    }
  }
  static async updateById(studentId, studentData) {
    const connection = await pool.getConnection()
    try {
      await connection.beginTransaction()
      /* se arman las clausulas para la query, el company_id se pasa a binario si está */
      const clauses = Object.keys(studentData)
        .map((key) =>
          key === 'company_id' ? `${key} = UUID_TO_BIN(?)` : `${key} = ?`
        )
        .join(', ')

      const values = Object.values(studentData)

      const [result] = await connection.query(
        `UPDATE students SET ${clauses} WHERE id = ?`,
        [...values, studentId]
      )

      await connection.commit()
      return result.affectedRows
    } catch (err) {
      console.log(err)
      await connection.rollback()
      throw new Error('Error al actualizar el estudiante')
    } finally {
      connection.release()
    }
  }
}
