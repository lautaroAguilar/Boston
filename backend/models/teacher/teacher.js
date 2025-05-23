const { pool } = require('../../config/database.js')

class TeacherModel {
  static async createWithUser(teacherData, hashedPassword) {
    const connection = await pool.getConnection()
    
    try {
      await connection.beginTransaction()
      
      // 1. Crear el usuario
      const [userResult] = await connection.query(
        `INSERT INTO users (first_name, last_name, email, password, role_id, active, is_temp_password)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          teacherData.firstName,  
          teacherData.lastName, 
          teacherData.email, 
          hashedPassword, 
          3, // ID del rol "docente"
          true,
          true // Siempre será contraseña temporal
        ]
      )
      
      const userId = userResult.insertId
      
      // 2. Crear el profesor
      const [teacherResult] = await connection.query(
        `INSERT INTO Teacher (firstName, lastName, email, phone, CBU, CUIT,
          professionalCategoryId, fictitiousSeniority, bostonSeniority, 
          observations, userId, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          teacherData.firstName, 
          teacherData.lastName, 
          teacherData.email, 
          teacherData.phone, 
          teacherData.CBU, 
          teacherData.CUIT,
          teacherData.professionalCategoryId, 
          teacherData.fictitiousSeniority,
          teacherData.bostonSeniority, 
          teacherData.observations, 
          userId
        ]
      )
      
      const teacherId = teacherResult.insertId
      
      // 3. Crear relaciones con idiomas
      if (teacherData.languages && teacherData.languages.length > 0) {
        for (const langId of teacherData.languages) {
          await connection.query(
            `INSERT INTO TeacherLanguages (teacherId, languageId) 
             VALUES (?, ?)`,
            [teacherId, langId]
          )
        }
      }
      
      // 4. Obtener el profesor con sus relaciones
      const [teacherDetails] = await connection.query(
        `SELECT t.*, pc.name as professionalCategoryName, u.active, u.last_login
         FROM Teacher t
         JOIN ProfessionalCategory pc ON t.professionalCategoryId = pc.id
         LEFT JOIN users u ON t.userId = u.id
         WHERE t.id = ?`,
        [teacherId]
      )
      
      // 5. Obtener los idiomas del profesor
      const [languages] = await connection.query(
        `SELECT l.* 
         FROM languages l
         JOIN TeacherLanguages tl ON l.id = tl.languageId
         WHERE tl.teacherId = ?`,
        [teacherId]
      )
      
      await connection.commit()
      
      const teacher = {
        ...teacherDetails[0],
        professionalCategory: {
          id: teacherDetails[0].professionalCategoryId,
          name: teacherDetails[0].professionalCategoryName
        },
        languages: languages.map(lang => ({
          language: lang
        })),
        user: {
          active: teacherDetails[0].active,
          last_login: teacherDetails[0].last_login
        }
      }
      
      return { 
        teacher,
        user: {
          id: userId,
          first_name: teacherData.firstName,
          last_name: teacherData.lastName,
          email: teacherData.email,
          role_id: 3,
          active: true
        }
      }
    } catch (error) {
      await connection.rollback()
      console.error('Error al crear el docente con usuario:', error)
      throw error
    } finally {
      connection.release()
    }
  }

  static async getAll() {
    const connection = await pool.getConnection()
    
    try {
      // Consulta principal para obtener datos básicos de teachers
      const [teachers] = await connection.query(
        `SELECT t.*, pc.name as categoryName, u.active, u.last_login
         FROM Teacher t
         JOIN ProfessionalCategory pc ON t.professionalCategoryId = pc.id
         LEFT JOIN users u ON t.userId = u.id
         ORDER BY t.id ASC`
      )
      
      // Para cada profesor, obtener sus idiomas
      const result = []
      for (const teacher of teachers) {
        const [languages] = await connection.query(
          `SELECT l.* 
           FROM languages l
           JOIN TeacherLanguages tl ON l.id = tl.languageId
           WHERE tl.teacherId = ?`,
          [teacher.id]
        )
        
        result.push({
          ...teacher,
          languages: languages.map(lang => ({
            language: lang
          })),
          professionalCategory: {
            id: teacher.professionalCategoryId,
            name: teacher.categoryName
          },
          user: {
            active: teacher.active,
            last_login: teacher.last_login
          }
        })
      }
      
      return result
    } catch (error) {
      console.error('Error al obtener los docentes:', error)
      throw error
    } finally {
      connection.release()
    }
  }

  static async getById(teacherId) {
    const connection = await pool.getConnection()
    
    try {
      // Obtener datos del profesor
      const [teachers] = await connection.query(
        `SELECT t.*, pc.name as categoryName, u.active, u.last_login
         FROM Teacher t
         JOIN ProfessionalCategory pc ON t.professionalCategoryId = pc.id
         LEFT JOIN users u ON t.userId = u.id
         WHERE t.id = ?`,
        [parseInt(teacherId)]
      )
      
      if (teachers.length === 0) return null
      
      // Obtener idiomas del profesor
      const [languages] = await connection.query(
        `SELECT l.* 
         FROM languages l
         JOIN TeacherLanguages tl ON l.id = tl.languageId
         WHERE tl.teacherId = ?`,
        [parseInt(teacherId)]
      )
      
      return {
        ...teachers[0],
        languages: languages.map(lang => ({
          language: lang
        })),
        professionalCategory: {
          id: teachers[0].professionalCategoryId,
          name: teachers[0].categoryName
        },
        user: {
          active: teachers[0].active,
          last_login: teachers[0].last_login
        }
      }
    } catch (error) {
      console.error('Error al obtener el docente:', error)
      throw error
    } finally {
      connection.release()
    }
  }

  static async updateById(teacherId, teacherData) {
    const connection = await pool.getConnection()
    
    try {
      await connection.beginTransaction()
      
      // 1. Actualizar información básica del profesor
      const setClauses = []
      const values = []
      
      const fieldsToUpdate = [
        'firstName', 'lastName', 'email', 'phone', 'CBU', 'CUIT',
        'professionalCategoryId', 'fictitiousSeniority', 'bostonSeniority', 'observations'
      ]
      
      fieldsToUpdate.forEach(field => {
        if (teacherData[field] !== undefined) {
          setClauses.push(`${field} = ?`)
          values.push(teacherData[field])
        }
      })
      
      if (setClauses.length > 0) {
        values.push(parseInt(teacherId))
        await connection.query(
          `UPDATE Teacher SET ${setClauses.join(', ')} WHERE id = ?`,
          values
        )
      }
      
      // 2. Actualizar idiomas: eliminar existentes y añadir nuevos
      if (teacherData.languages) {
        await connection.query(
          `DELETE FROM TeacherLanguages WHERE teacherId = ?`,
          [parseInt(teacherId)]
        )
        
        if (teacherData.languages.length > 0) {
          for (const langId of teacherData.languages) {
            await connection.query(
              `INSERT INTO TeacherLanguages (teacherId, languageId) VALUES (?, ?)`,
              [parseInt(teacherId), langId]
            )
          }
        }
      }
      
      // 3. Obtener el profesor actualizado con todas sus relaciones
      const [teachers] = await connection.query(
        `SELECT t.*, pc.name as categoryName, u.active, u.last_login
         FROM Teacher t
         JOIN ProfessionalCategory pc ON t.professionalCategoryId = pc.id
         LEFT JOIN users u ON t.userId = u.id
         WHERE t.id = ?`,
        [parseInt(teacherId)]
      )
      
      const [languages] = await connection.query(
        `SELECT l.* 
         FROM languages l
         JOIN TeacherLanguages tl ON l.id = tl.languageId
         WHERE tl.teacherId = ?`,
        [parseInt(teacherId)]
      )
      
      await connection.commit()
      
      return {
        ...teachers[0],
        languages: languages.map(lang => ({
          language: lang
        })),
        professionalCategory: {
          id: teachers[0].professionalCategoryId,
          name: teachers[0].categoryName
        },
        user: {
          active: teachers[0].active,
          last_login: teachers[0].last_login
        }
      }
    } catch (error) {
      await connection.rollback()
      console.error('Error al actualizar el docente:', error)
      throw error
    } finally {
      connection.release()
    }
  }

  static async deleteById(teacherId) {
    const connection = await pool.getConnection()
    
    try {
      await connection.beginTransaction()
      
      // 1. Primero obtenemos el userId
      const [teachers] = await connection.query(
        `SELECT userId FROM Teacher WHERE id = ?`,
        [parseInt(teacherId)]
      )
      
      if (teachers.length === 0) {
        throw new Error('Docente no encontrado')
      }
      
      const userId = teachers[0].userId
      
      // 2. Eliminar las relaciones con idiomas
      await connection.query(
        `DELETE FROM TeacherLanguages WHERE teacherId = ?`,
        [parseInt(teacherId)]
      )
      
      // 3. Eliminar el profesor
      await connection.query(
        `DELETE FROM Teacher WHERE id = ?`,
        [parseInt(teacherId)]
      )
      
      // 4. Si existe un usuario asociado, lo eliminamos
      if (userId) {
        await connection.query(
          `DELETE FROM users WHERE id = ?`,
          [userId]
        )
      }
      
      await connection.commit()
      return true
    } catch (error) {
      await connection.rollback()
      console.error('Error al eliminar el docente:', error)
      throw error
    } finally {
      connection.release()
    }
  }
}

module.exports = { TeacherModel } 