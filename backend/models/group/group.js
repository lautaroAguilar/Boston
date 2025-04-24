const { pool } = require('../../config/database.js')

class GroupModel {
  static async create(groupData) {
    const connection = await pool.getConnection()
    
    try {
      await connection.beginTransaction()
      
      const { students, ...groupInfo } = groupData

      // Buscar el estado por defecto si no se proporciona statusId
      let defaultStatusId = groupInfo.statusId
      if (!defaultStatusId) {
        const [defaultStatus] = await connection.query(
          `SELECT id FROM GroupStatus WHERE isDefault = 1 LIMIT 1`
        )
        
        if (defaultStatus && defaultStatus.length > 0) {
          defaultStatusId = defaultStatus[0].id
        }
      }

      // Buscar el estado activo por defecto para estudiantes
      const [defaultStudentStatus] = await connection.query(
        `SELECT id FROM StudentStatus WHERE isDefault = 1 LIMIT 1`
      )

      if (!defaultStudentStatus || defaultStudentStatus.length === 0) {
        throw new Error('No se encontró un estado por defecto para estudiantes')
      }
      const defaultStudentStatusId = defaultStudentStatus[0].id

      // Insertar el grupo básico
      const [groupResult] = await connection.query(
        `INSERT INTO \`Group\` (
          name, 
          teacherId, 
          languageId, 
          moduleId, 
          modalityId, 
          statusId, 
          companyId,
          updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          groupInfo.name,
          groupInfo.teacherId,
          groupInfo.languageId,
          groupInfo.moduleId,
          groupInfo.modalityId,
          defaultStatusId || groupInfo.statusId,
          groupInfo.companyId
        ]
      )
      
      const groupId = groupResult.insertId
      
      // Insertar los estudiantes asociados al grupo
      if (students && students.length > 0) {
        for (const studentId of students) {
          await connection.query(
            `INSERT INTO GroupStudent (groupId, studentId, statusId, updatedAt)
             VALUES (?, ?, ?, NOW())`,
            [groupId, studentId, defaultStudentStatusId]
          )
        }
      }
      
      // Obtener el grupo recién creado con sus relaciones
      const group = await this._getGroupWithRelations(connection, groupId)
      
      await connection.commit()
      return group
    } catch (error) {
      await connection.rollback()
      console.error('Error en GroupModel.create:', error)
      throw error
    } finally {
      connection.release()
    }
  }

  static async _getGroupWithRelations(connection, groupId) {
    // Obtener información básica del grupo
    const [groups] = await connection.query(
      `SELECT g.*, 
        t.firstName as teacherFirstName, t.lastName as teacherLastName,
        l.name as languageName,
        m.name as moduleName,
        md.name as modalityName,
        s.name as statusName
      FROM \`Group\` g
      LEFT JOIN Teacher t ON g.teacherId = t.id
      LEFT JOIN languages l ON g.languageId = l.id
      LEFT JOIN modules m ON g.moduleId = m.id
      LEFT JOIN Modality md ON g.modalityId = md.id
      LEFT JOIN GroupStatus s ON g.statusId = s.id
      WHERE g.id = ?`,
      [groupId]
    )
    
    if (groups.length === 0) return null
    
    // Obtener estudiantes del grupo
    const [students] = await connection.query(
      `SELECT 
        gs.studentId,
        gs.statusId,
        s.first_name, 
        s.last_name,
        ss.name as statusName
      FROM GroupStudent gs
      JOIN students s ON gs.studentId = s.id
      JOIN StudentStatus ss ON gs.statusId = ss.id
      WHERE gs.groupId = ?`,
      [groupId]
    )
    
    // Estructurar los datos
    return {
      id: groups[0].id,
      name: groups[0].name,
      teacher: {
        id: groups[0].teacherId,
        firstName: groups[0].teacherFirstName,
        lastName: groups[0].teacherLastName
      },
      language: {
        id: groups[0].languageId,
        name: groups[0].languageName
      },
      module: {
        id: groups[0].moduleId,
        name: groups[0].moduleName
      },
      modality: {
        id: groups[0].modalityId,
        name: groups[0].modalityName
      },
      status: {
        id: groups[0].statusId,
        name: groups[0].statusName
      },
      company: {
        id: groups[0].companyId
      },
      students: students.map(student => ({
        student: {
          id: student.studentId,
          first_name: student.first_name,
          last_name: student.last_name
        },
        status: {
          id: student.statusId,
          name: student.statusName
        }
      }))
    }
  }

  static async getAll(filters = {}) {
    const connection = await pool.getConnection()
    
    try {
      // Construir la consulta con posible filtro por compañía
      let whereClause = '';
      const params = [];
      
      // Solo aplicar filtro si companyId es un número válido
      if (filters.companyId && !isNaN(parseInt(filters.companyId))) {
        whereClause = 'WHERE g.companyId = ?';
        params.push(parseInt(filters.companyId));
      }
      
      // Obtener todos los grupos con filtro opcional
      const [groups] = await connection.query(
        `SELECT g.id, g.name, 
          g.teacherId, t.firstName as teacherFirstName, t.lastName as teacherLastName,
          g.languageId, l.name as languageName,
          g.moduleId, m.name as moduleName,
          g.modalityId, md.name as modalityName,
          g.statusId, s.name as statusName,
          g.companyId, cp.name as companyName
        FROM \`Group\` g
        LEFT JOIN Teacher t ON g.teacherId = t.id
        LEFT JOIN languages l ON g.languageId = l.id
        LEFT JOIN modules m ON g.moduleId = m.id
        LEFT JOIN Modality md ON g.modalityId = md.id
        LEFT JOIN GroupStatus s ON g.statusId = s.id
        LEFT JOIN company cp ON g.companyId = cp.id
        ${whereClause}
        ORDER BY g.id ASC`,
        params
      )
      
      // Para cada grupo, obtener sus estudiantes
      const result = []
      for (const group of groups) {
        const [students] = await connection.query(
          `SELECT 
            gs.studentId,
            gs.statusId,
            s.first_name, 
            s.last_name,
            ss.name as statusName
          FROM GroupStudent gs
          JOIN students s ON gs.studentId = s.id
          JOIN StudentStatus ss ON gs.statusId = ss.id
          WHERE gs.groupId = ?`,
          [group.id]
        )
        
        result.push({
          id: group.id,
          name: group.name,
          teacher: {
            id: group.teacherId,
            firstName: group.teacherFirstName,
            lastName: group.teacherLastName
          },
          language: {
            id: group.languageId,
            name: group.languageName
          },
          module: {
            id: group.moduleId,
            name: group.moduleName
          },
          modality: {
            id: group.modalityId,
            name: group.modalityName
          },
          status: {
            id: group.statusId,
            name: group.statusName
          },
          company: {
            id: group.companyId,
            name: group.companyName
          },
          students: students.map(student => ({
            student: {
              id: student.studentId,
              first_name: student.first_name,
              last_name: student.last_name
            },
            status: {
              id: student.statusId,
              name: student.statusName
            }
          }))
        })
      }
      
      return result
    } catch (error) {
      console.error('Error en GroupModel.getAll:', error)
      throw error
    } finally {
      connection.release()
    }
  }

  static async getById(id) {
    const connection = await pool.getConnection()
    
    try {
      return await this._getGroupWithRelations(connection, id)
    } catch (error) {
      console.error('Error en GroupModel.getById:', error)
      throw error
    } finally {
      connection.release()
    }
  }

  static async update(id, groupData) {
    const connection = await pool.getConnection()
    
    try {
      await connection.beginTransaction()
      
      const { students, ...groupInfo } = groupData
      
      // Actualizar datos básicos del grupo
      const setClauses = []
      const values = []
      
      Object.entries(groupInfo).forEach(([key, value]) => {
        if (value !== undefined) {
          setClauses.push(`${key} = ?`)
          values.push(value)
        }
      })
      
      if (setClauses.length > 0) {
        values.push(id)
        await connection.query(
          `UPDATE \`Group\` SET ${setClauses.join(', ')} WHERE id = ?`,
          values
        )
      }
      
      // Obtener el grupo actualizado
      const group = await this._getGroupWithRelations(connection, id)
      
      await connection.commit()
      return group
    } catch (error) {
      await connection.rollback()
      console.error('Error en GroupModel.update:', error)
      throw error
    } finally {
      connection.release()
    }
  }

  static async delete(id) {
    const connection = await pool.getConnection()
    
    try {
      await connection.beginTransaction()
      
      // Primero eliminamos las relaciones con estudiantes
      await connection.query(
        `DELETE FROM GroupStudent WHERE groupId = ?`,
        [id]
      )
      
      // Luego eliminamos el grupo
      await connection.query(
        `DELETE FROM \`Group\` WHERE id = ?`,
        [id]
      )
      
      await connection.commit()
      return { id }
    } catch (error) {
      await connection.rollback()
      console.error('Error en GroupModel.delete:', error)
      throw error
    } finally {
      connection.release()
    }
  }

  static async addStudents(groupId, studentIds) {
    const connection = await pool.getConnection()
    
    try {
      await connection.beginTransaction()
      
      // Buscar el estado activo por defecto para estudiantes
      const [defaultStudentStatus] = await connection.query(
        `SELECT id FROM StudentStatus WHERE isDefault = 1 LIMIT 1`
      )

      if (!defaultStudentStatus || defaultStudentStatus.length === 0) {
        throw new Error('No se encontró un estado por defecto para estudiantes')
      }
      const defaultStudentStatusId = defaultStudentStatus[0].id
      
      // Agregar estudiantes al grupo
      for (const studentId of studentIds) {
        await connection.query(
          `INSERT INTO GroupStudent (groupId, studentId, statusId)
           VALUES (?, ?, ?)`,
          [groupId, studentId, defaultStudentStatusId]
        )
      }
      
      // Obtener el grupo actualizado
      const group = await this._getGroupWithRelations(connection, groupId)
      
      await connection.commit()
      return group
    } catch (error) {
      await connection.rollback()
      console.error('Error en GroupModel.addStudents:', error)
      throw error
    } finally {
      connection.release()
    }
  }

  static async removeStudent(groupId, studentId) {
    const connection = await pool.getConnection()
    
    try {
      await connection.beginTransaction()
      
      const [result] = await connection.query(
        `DELETE FROM GroupStudent 
         WHERE groupId = ? AND studentId = ?`,
        [groupId, studentId]
      )
      
      await connection.commit()
      return { affectedRows: result.affectedRows }
    } catch (error) {
      await connection.rollback()
      console.error('Error en GroupModel.removeStudent:', error)
      throw error
    } finally {
      connection.release()
    }
  }

  static async updateStudentStatus(groupId, studentId, statusId) {
    const connection = await pool.getConnection()
    
    try {
      await connection.beginTransaction()
      
      const [result] = await connection.query(
        `UPDATE GroupStudent 
         SET statusId = ?
         WHERE groupId = ? AND studentId = ?`,
        [statusId, groupId, studentId]
      )
      
      await connection.commit()
      return { affectedRows: result.affectedRows }
    } catch (error) {
      await connection.rollback()
      console.error('Error en GroupModel.updateStudentStatus:', error)
      throw error
    } finally {
      connection.release()
    }
  }
}

module.exports = { GroupModel }
