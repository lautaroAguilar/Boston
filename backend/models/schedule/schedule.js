const { pool } = require('../../config/database.js')

class ScheduleModel {
  static async generateClasses(groupId, scheduleData, teacherId) {
    const classes = []
    const startDate = new Date(scheduleData.startDate)
    const endDate = new Date(scheduleData.endDate)

    // Iteramos por cada día entre startDate y endDate
    for (
      let date = new Date(startDate);
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      // Para cada día en el cronograma
      for (const day of scheduleData.days) {
        // Si el día de la semana coincide (0 = Domingo, 6 = Sábado)
        if (date.getDay() === day.dayOfWeek) {
          // Parseamos la hora de inicio
          const [hours, minutes] = day.startTime.split(':').map(Number)
          const startTime = new Date(date)
          startTime.setHours(hours, minutes, 0)

          // Calculamos la hora de fin basada en la duración
          const endTime = new Date(startTime)
          endTime.setMinutes(endTime.getMinutes() + day.duration)

          classes.push({
            groupId: parseInt(groupId),
            teacherId: teacherId,
            date: new Date(date),
            startTime,
            endTime
          })
        }
      }
    }

    return classes
  }

  static async create(groupId, scheduleData) {
    const connection = await pool.getConnection()
    
    try {
      await connection.beginTransaction()
      
      // Primero obtenemos el grupo para acceder a sus datos
      const [groups] = await connection.query(
        `SELECT * FROM \`Group\` WHERE id = ?`,
        [parseInt(groupId)]
      )

      if (groups.length === 0) {
        throw new Error('Grupo no encontrado')
      }
      
      const group = groups[0]

      // Creamos el cronograma
      const [scheduleResult] = await connection.query(
        `INSERT INTO Schedule (
          groupId, companyId, days, startDate, endDate, updatedAt
        ) VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          parseInt(groupId),
          group.companyId,
          JSON.stringify(scheduleData.days),
          new Date(scheduleData.startDate),
          new Date(scheduleData.endDate)
        ]
      )

      // Generamos y creamos las clases
      const classes = await this.generateClasses(
        parseInt(groupId),
        scheduleData,
        group.teacherId
      )
      
      // Insertamos las clases
      for (const classItem of classes) {
        await connection.query(
          `INSERT INTO Class (
            groupId, teacherId, date, startTime, endTime, updatedAt
          ) VALUES (?, ?, ?, ?, ?, NOW())`,
          [
            classItem.groupId,
            classItem.teacherId,
            classItem.date,
            classItem.startTime,
            classItem.endTime
          ]
        )
      }
      
      // Obtenemos el cronograma creado con sus relaciones
      const [schedule] = await connection.query(
        `SELECT s.*, g.name as groupName 
         FROM Schedule s
         JOIN \`Group\` g ON s.groupId = g.id
         WHERE s.id = ?`,
        [scheduleResult.insertId]
      )
      
      await connection.commit()
      
      return {
        ...schedule[0],
        days: JSON.parse(schedule[0].days),
        group: {
          id: group.id,
          name: schedule[0].groupName
        }
      }
    } catch (error) {
      await connection.rollback()
      console.error('Error en ScheduleModel.create:', error)
      throw error
    } finally {
      connection.release()
    }
  }

  static async getAll() {
    const connection = await pool.getConnection()
    
    try {
      const [schedules] = await connection.query(
        `SELECT 
          s.id, 
          s.companyId, 
          s.days, 
          s.startDate, 
          s.endDate,
          s.groupId,
          g.name as groupName,
          g.moduleId,
          g.languageId,
          g.teacherId,
          m.name as moduleName,
          l.name as languageName,
          t.firstName as teacherFirstName,
          t.lastName as teacherLastName
        FROM Schedule s
        JOIN \`Group\` g ON s.groupId = g.id
        LEFT JOIN modules m ON g.moduleId = m.id
        LEFT JOIN languages l ON g.languageId = l.id
        LEFT JOIN Teacher t ON g.teacherId = t.id`
      )
      
      // Formatear los resultados
      return schedules.map(s => {
        // Comprobar si days es una cadena y analizarla
        let days;
        try {
          days = typeof s.days === 'string' ? JSON.parse(s.days) : s.days;
        } catch (e) {
          console.error('Error al parsear days JSON:', e, s.days);
          days = []; // Valor predeterminado en caso de error
        }
        
        return {
          id: s.id,
          companyId: s.companyId,
          days,
          startDate: s.startDate,
          endDate: s.endDate,
          group: {
            id: s.groupId,
            name: s.groupName,
            module: {
              id: s.moduleId,
              name: s.moduleName
            },
            language: {
              id: s.languageId,
              name: s.languageName
            },
            teacher: {
              id: s.teacherId,
              firstName: s.teacherFirstName,
              lastName: s.teacherLastName
            }
          }
        };
      });
    } catch (error) {
      console.error('Error en ScheduleModel.getAll:', error)
      throw error
    } finally {
      connection.release()
    }
  }

  static async getByGroupId(groupId) {
    const connection = await pool.getConnection()
    
    try {
      const [schedules] = await connection.query(
        `SELECT s.*, g.name as groupName 
         FROM Schedule s
         JOIN \`Group\` g ON s.groupId = g.id
         WHERE s.groupId = ?`,
        [parseInt(groupId)]
      )
      
      if (schedules.length === 0) {
        return null
      }
      
      // Manejo seguro del parsing JSON
      let days;
      try {
        days = typeof schedules[0].days === 'string' ? JSON.parse(schedules[0].days) : schedules[0].days;
      } catch (e) {
        console.error('Error al parsear days JSON:', e, schedules[0].days);
        days = []; // Valor predeterminado en caso de error
      }
      
      return {
        ...schedules[0],
        days,
        group: {
          id: parseInt(groupId),
          name: schedules[0].groupName
        }
      }
    } catch (error) {
      console.error('Error en ScheduleModel.getByGroupId:', error)
      throw error
    } finally {
      connection.release()
    }
  }

  static async update(groupId, scheduleData) {
    const connection = await pool.getConnection()
    
    try {
      await connection.beginTransaction()
      
      // Obtenemos el grupo
      const [groups] = await connection.query(
        `SELECT * FROM \`Group\` WHERE id = ?`,
        [parseInt(groupId)]
      )

      if (groups.length === 0) {
        throw new Error('Grupo no encontrado')
      }
      
      const group = groups[0]

      // Eliminamos todas las clases futuras del grupo
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      await connection.query(
        `DELETE FROM Class 
         WHERE groupId = ? AND date >= ?`,
        [parseInt(groupId), today]
      )

      // Actualizamos el cronograma
      await connection.query(
        `UPDATE Schedule 
         SET days = ?, startDate = ?, endDate = ? 
         WHERE groupId = ?`,
        [
          JSON.stringify(scheduleData.days),
          new Date(scheduleData.startDate),
          new Date(scheduleData.endDate),
          parseInt(groupId)
        ]
      )

      // Generamos y creamos las nuevas clases
      const classes = await this.generateClasses(
        parseInt(groupId),
        scheduleData,
        group.teacherId
      )
      
      // Insertamos las clases nuevas
      for (const classItem of classes) {
        await connection.query(
          `INSERT INTO Class (
            groupId, teacherId, date, startTime, endTime
          ) VALUES (?, ?, ?, ?, ?)`,
          [
            classItem.groupId,
            classItem.teacherId,
            classItem.date,
            classItem.startTime,
            classItem.endTime
          ]
        )
      }
      
      // Obtenemos el cronograma actualizado
      const [schedules] = await connection.query(
        `SELECT s.*, g.name as groupName 
         FROM Schedule s
         JOIN \`Group\` g ON s.groupId = g.id
         WHERE s.groupId = ?`,
        [parseInt(groupId)]
      )
      
      await connection.commit()
      
      return {
        ...schedules[0],
        days: JSON.parse(schedules[0].days),
        group: {
          id: parseInt(groupId),
          name: schedules[0].groupName
        }
      }
    } catch (error) {
      await connection.rollback()
      console.error('Error en ScheduleModel.update:', error)
      throw error
    } finally {
      connection.release()
    }
  }

  static async delete(groupId) {
    const connection = await pool.getConnection()
    
    try {
      await connection.beginTransaction()
      
      // Eliminamos todas las clases futuras
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      await connection.query(
        `DELETE FROM Class 
         WHERE groupId = ? AND date >= ?`,
        [parseInt(groupId), today]
      )

      // Eliminamos el cronograma
      await connection.query(
        `DELETE FROM Schedule WHERE groupId = ?`,
        [parseInt(groupId)]
      )
      
      await connection.commit()
      return true
    } catch (error) {
      await connection.rollback()
      console.error('Error en ScheduleModel.delete:', error)
      throw error
    } finally {
      connection.release()
    }
  }

  static async addSingleClass(groupId, classData) {
    const connection = await pool.getConnection()
    
    try {
      await connection.beginTransaction()
      
      // Verificamos que el grupo exista y obtenemos el teacherId
      const [groups] = await connection.query(
        `SELECT * FROM \`Group\` WHERE id = ?`,
        [parseInt(groupId)]
      )

      if (groups.length === 0) {
        throw new Error('Grupo no encontrado')
      }
      
      const group = groups[0]

      // Parseamos la fecha y hora
      const [hours, minutes] = classData.startTime.split(':').map(Number)
      const startTime = new Date(classData.date)
      startTime.setHours(hours, minutes, 0)

      // Calculamos la hora de fin
      const endTime = new Date(startTime)
      endTime.setMinutes(endTime.getMinutes() + classData.duration)

      // Verificamos si ya existe una clase en ese horario
      const [existingClasses] = await connection.query(
        `SELECT * FROM Class
         WHERE groupId = ? AND date = ? AND 
         ((startTime <= ? AND endTime > ?) OR 
          (startTime < ? AND endTime >= ?))`,
        [
          parseInt(groupId), 
          new Date(classData.date),
          startTime, startTime,
          endTime, endTime
        ]
      )

      if (existingClasses.length > 0) {
        throw new Error('Ya existe una clase programada en ese horario')
      }

      // Creamos la nueva clase
      const [classResult] = await connection.query(
        `INSERT INTO Class (
          groupId, teacherId, date, startTime, endTime
        ) VALUES (?, ?, ?, ?, ?)`,
        [
          parseInt(groupId),
          group.teacherId,
          new Date(classData.date),
          startTime,
          endTime
        ]
      )
      
      // Obtenemos la clase recién creada
      const [newClass] = await connection.query(
        `SELECT * FROM Class WHERE id = ?`,
        [classResult.insertId]
      )
      
      await connection.commit()
      return newClass[0]
    } catch (error) {
      await connection.rollback()
      console.error('Error en ScheduleModel.addSingleClass:', error)
      throw error
    } finally {
      connection.release()
    }
  }

  static async _getClasses(connection, filters = {}) {
    try {
      // Construir la cláusula WHERE base
      let whereClause = '1=1'
      const params = []
      
      // Filtrar por fecha - Versión mejorada inspirada en el comportamiento de Prisma
      if (filters.date) {
        try {
          // Asegurarse de que tenemos un objeto Date válido
          let dateObj = filters.date;
          if (typeof filters.date === 'string') {
            dateObj = new Date(filters.date);
          }
          
          // Formatear la fecha al formato MySQL (YYYY-MM-DD)
          const formattedDate = dateObj.toISOString().split('T')[0];
          
          // Usar la función DATE() de MySQL para comparar solo la parte de fecha
          whereClause += ' AND DATE(c.date) = ?';
          params.push(formattedDate);
        } catch (e) {
          console.error('Error al procesar la fecha:', e);
          // Si hay error en la fecha, ignoramos el filtro
        }
      }
      
      // Filtrar por compañía
      if (filters.companyId) {
        whereClause += ' AND g.companyId = ?'
        params.push(parseInt(filters.companyId))
      }
      
      // Filtrar por grupo
      if (filters.groupId) {
        whereClause += ' AND c.groupId = ?'
        params.push(parseInt(filters.groupId))
      }
      
      // Filtrar por profesor
      if (filters.teacherId) {
        whereClause += ' AND c.teacherId = ?'
        params.push(parseInt(filters.teacherId))
      }
      
      const query = `
        SELECT 
          c.id, c.date, c.startTime, c.endTime,
          g.id as groupId, g.name as groupName,
          l.id as languageId, l.name as languageName,
          m.id as moduleId, m.name as moduleName,
          md.id as modalityId, md.name as modalityName,
          gs.id as statusId, gs.name as statusName,
          cp.id as companyId, cp.name as companyName,
          t.id as teacherId, t.firstName as teacherFirstName, t.lastName as teacherLastName
        FROM Class c
        JOIN \`Group\` g ON c.groupId = g.id
        LEFT JOIN languages l ON g.languageId = l.id
        LEFT JOIN modules m ON g.moduleId = m.id
        LEFT JOIN Modality md ON g.modalityId = md.id
        LEFT JOIN GroupStatus gs ON g.statusId = gs.id
        LEFT JOIN company cp ON g.companyId = cp.id
        LEFT JOIN Teacher t ON c.teacherId = t.id
        WHERE ${whereClause}
        ORDER BY c.date ASC, c.startTime ASC
      `;
      
      // Para depuración, comentar en producción
      console.log('Filtros recibidos:', filters);
      console.log('Consulta SQL:', query);
      console.log('Parámetros:', params);
      
      const [classes] = await connection.query(query, params);
      console.log(`Se encontraron ${classes.length} clases`);
      
      // Si no hay clases, devolver array vacío
      if (classes.length === 0) {
        return [];
      }
      
      // Obtener estudiantes para cada clase
      const classesWithDetails = [];
      
      for (const classItem of classes) {
        // Obtener estudiantes del grupo
        const [students] = await connection.query(
          `SELECT 
            s.id, s.first_name, s.last_name,
            gs.statusId,
            ss.name as statusName,
            ss.description as statusDescription
          FROM GroupStudent gs
          JOIN students s ON gs.studentId = s.id
          JOIN StudentStatus ss ON gs.statusId = ss.id
          WHERE gs.groupId = ?`,
          [classItem.groupId]
        );
        
        // Calcular la duración en horas basada en startTime y endTime
        let durationHours = null;
        
        try {
          if (classItem.startTime && classItem.endTime) {
            // Convertir ambos timestamps a objetos Date para la comparación
            const startParts = classItem.startTime.toString().split(':');
            const endParts = classItem.endTime.toString().split(':');
            
            if (startParts.length >= 2 && endParts.length >= 2) {
              const startHours = parseInt(startParts[0], 10);
              const startMinutes = parseInt(startParts[1], 10);
              
              const endHours = parseInt(endParts[0], 10);
              const endMinutes = parseInt(endParts[1], 10);
              
              // Calcular la diferencia en minutos
              const startTotalMinutes = startHours * 60 + startMinutes;
              const endTotalMinutes = endHours * 60 + endMinutes;
              
              let diffMinutes = endTotalMinutes - startTotalMinutes;
              // Manejar casos donde endTime es al día siguiente
              if (diffMinutes < 0) {
                diffMinutes += 24 * 60;
              }
              
              // Convertir minutos a horas para la visualización
              durationHours = diffMinutes / 60;
            }
          }
        } catch (error) {
          console.error('Error al calcular la duración:', error);
        }
        
        classesWithDetails.push({
          id: classItem.id,
          date: classItem.date,
          startTime: classItem.startTime,
          endTime: classItem.endTime,
          duration: durationHours,
          studentsCount: students.length,
          level: classItem.moduleName,
          group: {
            id: classItem.groupId,
            name: classItem.groupName,
            language: {
              id: classItem.languageId,
              name: classItem.languageName
            },
            module: {
              id: classItem.moduleId,
              name: classItem.moduleName
            },
            modality: {
              id: classItem.modalityId,
              name: classItem.modalityName
            },
            status: {
              id: classItem.statusId,
              name: classItem.statusName
            },
            company: {
              id: classItem.companyId,
              name: classItem.companyName
            },
            students: students.map(student => ({
              student: {
                id: student.id,
                first_name: student.first_name,
                last_name: student.last_name
              },
              status: {
                id: student.statusId,
                name: student.statusName,
                description: student.statusDescription
              }
            }))
          },
          teacher: {
            id: classItem.teacherId,
            firstName: classItem.teacherFirstName,
            lastName: classItem.teacherLastName
          }
        });
      }
      
      return classesWithDetails;
    } catch (error) {
      console.error('Error en ScheduleModel._getClasses:', error);
      throw error;
    }
  }

  static async getClassesByDateAndCompany(date, companyId) {
    const connection = await pool.getConnection()
    
    try {
      console.log('Parámetros recibidos - fecha:', date, 'compañía:', companyId);
      const classes = await this._getClasses(connection, { 
        date, 
        companyId: parseInt(companyId) 
      });
      return classes;
    } catch (error) {
      console.error('Error en ScheduleModel.getClassesByDateAndCompany:', error)
      throw error
    } finally {
      connection.release()
    }
  }
  
  // Nuevo método para obtener todas las clases
  static async getAllClasses(filters = {}) {
    const connection = await pool.getConnection()
    
    try {
      const classes = await this._getClasses(connection, filters)
      return classes
    } catch (error) {
      console.error('Error en ScheduleModel.getAllClasses:', error)
      throw error
    } finally {
      connection.release()
    }
  }
  
  // Nuevo método para obtener clases por grupo
  static async getClassesByGroup(groupId) {
    const connection = await pool.getConnection()
    
    try {
      const classes = await this._getClasses(connection, { groupId })
      return classes
    } catch (error) {
      console.error('Error en ScheduleModel.getClassesByGroup:', error)
      throw error
    } finally {
      connection.release()
    }
  }
}

module.exports = { ScheduleModel }
