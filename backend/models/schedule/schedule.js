const { pool } = require('../../config/database.js')
const { validateClass } = require('../../schemas/class/class');
const { AttendanceModel } = require('../attendance/attendance');
const { Temporal } = require('temporal-polyfill');

class ScheduleModel {
  static async generateClasses(groupId, scheduleData, teacherId) {
    const classes = []
    
    // Usar Temporal.PlainDate para fechas sin zona horaria
    const startDate = Temporal.PlainDate.from(scheduleData.startDate)
    const endDate = Temporal.PlainDate.from(scheduleData.endDate)

    // Iterar por cada día de manera segura
    let currentDate = startDate
    while (Temporal.PlainDate.compare(currentDate, endDate) <= 0) {
      // Para cada día en el cronograma
      for (const day of scheduleData.days) {
        // Temporal usa 1-7 (Lunes-Domingo), JavaScript Date usa 0-6 (Domingo-Sábado)
        // Convertir dayOfWeek del formato JavaScript (0=Domingo) al formato Temporal (7=Domingo)
        const temporalDayOfWeek = day.dayOfWeek === 0 ? 7 : day.dayOfWeek
        
        // Si el día de la semana coincide
        if (currentDate.dayOfWeek === temporalDayOfWeek) {
          // Crear PlainTime para la hora de inicio
          const startTime = Temporal.PlainTime.from(day.startTime)
          
          // Combinar fecha y hora
          const startDateTime = currentDate.toPlainDateTime(startTime)
          
          // Calcular hora de fin usando Duration
          const duration = Temporal.Duration.from({ minutes: day.duration })
          const endDateTime = startDateTime.add(duration)

          classes.push({
            groupId: parseInt(groupId),
            teacherId: teacherId,
            date: currentDate.toString(), // YYYY-MM-DD formato
            startTime: startDateTime.toPlainTime().toString(), // HH:MM:SS formato
            endTime: endDateTime.toPlainTime().toString()
          })
        }
      }
      
      // Avanzar un día de manera segura
      currentDate = currentDate.add({ days: 1 })
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

      // Convertir fechas para la base de datos usando Temporal
      const startDateForDB = Temporal.PlainDate.from(scheduleData.startDate).toString()
      const endDateForDB = Temporal.PlainDate.from(scheduleData.endDate).toString()

      // Creamos el cronograma
      const [scheduleResult] = await connection.query(
        `INSERT INTO Schedule (
          groupId, companyId, days, startDate, endDate, updatedAt
        ) VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          parseInt(groupId),
          group.companyId,
          JSON.stringify(scheduleData.days),
          startDateForDB,
          endDateForDB
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
        // Validar la clase con zod antes de insertar
        const validated = validateClass({
          date: classItem.date, // Ya está en formato YYYY-MM-DD
          startTime: classItem.startTime.slice(0, 5), // HH:MM (remover segundos)
          endTime: classItem.endTime.slice(0, 5), // HH:MM (remover segundos)
          // otros campos opcionales si los tienes
        });
        if (!validated.success) {
          throw new Error('Clase generada inválida: ' + JSON.stringify(validated.error.issues));
        }
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
        days: schedule[0].days,
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

  static async getAll(filters = {}) {
    const connection = await pool.getConnection()
    
    try {
      // Construir la consulta con posible filtro por compañía
      let whereClause = '';
      const params = [];
      
      // Solo aplicar filtro si companyId es un número válido
      if (filters.companyId && !isNaN(parseInt(filters.companyId))) {
        whereClause = 'WHERE s.companyId = ?';
        params.push(parseInt(filters.companyId));
      }
      
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
        LEFT JOIN Teacher t ON g.teacherId = t.id
        ${whereClause}`,
        params
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
      // Validar que groupId sea un número válido
      const parsedGroupId = parseInt(groupId);
      if (isNaN(parsedGroupId)) {
        throw new Error(`ID de grupo inválido: ${groupId}`);
      }
      
      const [schedules] = await connection.query(
        `SELECT s.*, g.name as groupName 
         FROM Schedule s
         JOIN \`Group\` g ON s.groupId = g.id
         WHERE s.groupId = ?`,
        [parsedGroupId]
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
          id: parsedGroupId,
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

      // Eliminamos todas las clases futuras del grupo usando Temporal
      const today = Temporal.Now.plainDateISO()
      
      await connection.query(
        `DELETE FROM Class 
         WHERE groupId = ? AND date >= ?`,
        [parseInt(groupId), today.toString()]
      )

      // Convertir fechas para la base de datos usando Temporal
      const startDateForDB = Temporal.PlainDate.from(scheduleData.startDate).toString()
      const endDateForDB = Temporal.PlainDate.from(scheduleData.endDate).toString()

      // Actualizamos el cronograma
      await connection.query(
        `UPDATE Schedule 
         SET days = ?, startDate = ?, endDate = ? 
         WHERE groupId = ?`,
        [
          JSON.stringify(scheduleData.days),
          startDateForDB,
          endDateForDB,
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
        // Validar la clase con zod antes de insertar
        const validated = validateClass({
          date: classItem.date, // Ya está en formato YYYY-MM-DD
          startTime: classItem.startTime.slice(0, 5), // HH:MM (remover segundos)
          endTime: classItem.endTime.slice(0, 5), // HH:MM (remover segundos)
          // otros campos opcionales si los tienes
        });
        if (!validated.success) {
          throw new Error('Clase generada inválida: ' + JSON.stringify(validated.error.issues));
        }
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
        days: schedules[0].days,
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
      
      // Eliminamos todas las clases futuras usando Temporal
      const today = Temporal.Now.plainDateISO()
      
      await connection.query(
        `DELETE FROM Class 
         WHERE groupId = ? AND date >= ?`,
        [parseInt(groupId), today.toString()]
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

      // Usar Temporal para parsear la fecha y hora
      const classDate = Temporal.PlainDate.from(classData.date)
      const startTime = Temporal.PlainTime.from(classData.startTime)
      const endTime = Temporal.PlainTime.from(classData.endTime)
      
      // Combinar fecha y hora
      const startDateTime = classDate.toPlainDateTime(startTime)
      const endDateTime = classDate.toPlainDateTime(endTime)

      // Verificamos si ya existe una clase en ese horario
      const [existingClasses] = await connection.query(
        `SELECT * FROM Class
         WHERE groupId = ? AND date = ? AND 
         ((startTime <= ? AND endTime > ?) OR 
          (startTime < ? AND endTime >= ?))`,
        [
          parseInt(groupId), 
          classDate.toString(),
          startDateTime.toPlainTime().toString(),
          startDateTime.toPlainTime().toString(),
          endDateTime.toPlainTime().toString(),
          endDateTime.toPlainTime().toString()
        ]
      )

      if (existingClasses.length > 0) {
        throw new Error('Ya existe una clase programada en ese horario')
      }

      // Creamos la nueva clase
      const [classResult] = await connection.query(
        `INSERT INTO Class (
          groupId, teacherId, date, startTime, endTime, updatedAt
        ) VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          parseInt(groupId),
          group.teacherId,
          classDate.toString(),
          startDateTime.toPlainTime().toString(),
          endDateTime.toPlainTime().toString()
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
      
      // Filtrar por fecha - Versión mejorada usando Temporal
      if (filters.date) {
        try {
          // Usar Temporal para manejar la fecha de manera segura
          let formattedDate;
          if (typeof filters.date === 'string') {
            formattedDate = Temporal.PlainDate.from(filters.date).toString();
          } else if (filters.date instanceof Date) {
            const year = filters.date.getFullYear();
            const month = filters.date.getMonth() + 1;
            const day = filters.date.getDate();
            formattedDate = Temporal.PlainDate.from({ year, month, day }).toString();
          } else {
            formattedDate = filters.date.toString();
          }
          
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
      // Filtrar por ID de clase
      if (filters.id) {
        whereClause += ' AND c.id = ?'
        params.push(parseInt(filters.id))
      }
      
      const query = `
        SELECT 
          c.id, c.date, c.startTime, c.endTime, c.teacherAttendance, c.activities, c.observations, c.content,
          g.id as groupId, g.name as groupName,
          l.id as languageId, l.name as languageName,
          m.id as moduleId, m.name as moduleName,
          md.id as modalityId, md.name as modalityName,
          gs.id as statusId, gs.name as statusName,
          cp.id as companyId, cp.name as companyName,
          t.id as teacherId, t.firstName as teacherFirstName, t.lastName as teacherLastName,
          a.id as attendanceId, a.studentId as attendanceStudentId, a.status as attendanceStatus, 
          a.timeAttendance as attendanceTime, a.date as attendanceDate,
          s.first_name as studentFirstName, s.last_name as studentLastName
        FROM Class c
        JOIN \`Group\` g ON c.groupId = g.id
        LEFT JOIN languages l ON g.languageId = l.id
        LEFT JOIN modules m ON g.moduleId = m.id
        LEFT JOIN Modality md ON g.modalityId = md.id
        LEFT JOIN GroupStatus gs ON g.statusId = gs.id
        LEFT JOIN company cp ON g.companyId = cp.id
        LEFT JOIN Teacher t ON c.teacherId = t.id
        LEFT JOIN Attendance a ON c.id = a.classId
        LEFT JOIN students s ON a.studentId = s.id
        WHERE ${whereClause}
        ORDER BY c.date ASC, c.startTime ASC
      `;
      
      const [classes] = await connection.query(query, params);
      
      // Si no hay clases, devolver array vacío
      if (classes.length === 0) {
        return [];
      }
      
      // Agrupar las clases por ID para manejar múltiples registros de asistencia
      const classMap = new Map();
      
      for (const row of classes) {
        if (!classMap.has(row.id)) {
          // Crear una nueva entrada para la clase
          const classItem = {
            id: row.id,
            date: row.date,
            startTime: row.startTime,
            endTime: row.endTime,
            teacherAttendance: row.teacherAttendance,
            activities: row.activities,
            observations: row.observations,
            content: row.content,
            group: {
              id: row.groupId,
              name: row.groupName,
              language: {
                id: row.languageId,
                name: row.languageName
              },
              module: {
                id: row.moduleId,
                name: row.moduleName
              },
              modality: {
                id: row.modalityId,
                name: row.modalityName
              },
              status: {
                id: row.statusId,
                name: row.statusName
              },
              company: {
                id: row.companyId,
                name: row.companyName
              },
              students: []
            },
            teacher: {
              id: row.teacherId,
              firstName: row.teacherFirstName,
              lastName: row.teacherLastName
            },
            attendances: []
          };
          
          // Calcular la duración en horas
          let durationHours = null;
          try {
            if (row.startTime && row.endTime) {
              const startParts = row.startTime.toString().split(':');
              const endParts = row.endTime.toString().split(':');
              
              if (startParts.length >= 2 && endParts.length >= 2) {
                const startHours = parseInt(startParts[0], 10);
                const startMinutes = parseInt(startParts[1], 10);
                const endHours = parseInt(endParts[0], 10);
                const endMinutes = parseInt(endParts[1], 10);
                
                const startTotalMinutes = startHours * 60 + startMinutes;
                const endTotalMinutes = endHours * 60 + endMinutes;
                
                let diffMinutes = endTotalMinutes - startTotalMinutes;
                if (diffMinutes < 0) {
                  diffMinutes += 24 * 60;
                }
                
                durationHours = diffMinutes / 60;
              }
            }
          } catch (error) {
            console.error('Error al calcular la duración:', error);
          }
          
          classItem.duration = durationHours;
          classMap.set(row.id, classItem);
        }
        
        // Agregar la asistencia si existe
        if (row.attendanceId) {
          const attendance = {
            id: row.attendanceId,
            studentId: row.attendanceStudentId,
            status: row.attendanceStatus,
            timeAttendance: row.attendanceTime,
            date: row.attendanceDate,
            student: {
              id: row.attendanceStudentId,
              first_name: row.studentFirstName,
              last_name: row.studentLastName
            }
          };
          
          classMap.get(row.id).attendances.push(attendance);
        }
      }
      
      // Obtener estudiantes para cada clase
      for (const [classId, classItem] of classMap) {
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
          [classItem.group.id]
        );
        
        classItem.group.students = students.map(student => ({
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
        }));
        
        classItem.studentsCount = students.length;
      }
      
      return Array.from(classMap.values());
    } catch (error) {
      console.error('Error en ScheduleModel._getClasses:', error);
      throw error;
    }
  }

  static async getClassesByDateAndCompany(date, companyId) {
    const connection = await pool.getConnection()
    
    try {
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
  static async getClassesById(classId) {
    const connection = await pool.getConnection()
    try {
      const classes = await this._getClasses(connection, { id: classId })
      return classes
    } catch (error) {
      console.error('Error en ScheduleModel.getClassesById:', error)
      throw error
    } finally {
      connection.release()
    }
  }
  static async updateClass(classId, updateData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Construir dinámicamente el SET de la consulta para actualizar la clase
      const fields = [];
      const values = [];

      if (updateData.date) {
        fields.push('date = ?');
        values.push(new Date(updateData.date));
      }
      if (updateData.startTime) {
        fields.push('startTime = ?');
        values.push(new Date(updateData.startTime));
      }
      if (updateData.endTime) {
        fields.push('endTime = ?');
        values.push(new Date(updateData.endTime));
      }
      if (updateData.teacherAttendance !== undefined) {
        fields.push('teacherAttendance = ?');
        values.push(updateData.teacherAttendance);
      }
      if (updateData.activities !== undefined) {
        fields.push('activities = ?');
        values.push(updateData.activities);
      }
      if (updateData.observations !== undefined) {
        fields.push('observations = ?');
        values.push(updateData.observations);
      }
      if (updateData.content !== undefined) {
        fields.push('content = ?');
        values.push(updateData.content);
      }

      // Si hay campos para actualizar en la clase
      if (fields.length > 0) {
        fields.push('updatedAt = NOW()');

        const sql = `UPDATE Class SET ${fields.join(', ')} WHERE id = ?`;
        values.push(classId);

        await connection.query(sql, values);
      }

      // Si se recibieron datos de asistencia de alumnos, procesarlos
      if (updateData.attendances && Array.isArray(updateData.attendances) && updateData.attendances.length > 0) {
        // Obtener la fecha de la clase si no se está actualizando
        let classDate;
        if (!updateData.date) {
          const [classInfo] = await connection.query(
            `SELECT date FROM Class WHERE id = ?`,
            [classId]
          );
          if (classInfo && classInfo.length > 0) {
            classDate = classInfo[0].date;
          } else {
            throw new Error('Clase no encontrada');
          }
        } else {
          classDate = new Date(updateData.date);
        }

        for (const attendance of updateData.attendances) {
          // Verificar que la asistencia tenga los campos necesarios
          if (!attendance.studentId) {
            continue; // Saltar este registro si no tiene studentId
          }

          // Buscar si ya existe un registro de asistencia para este alumno y esta clase
          const [existingAttendance] = await connection.query(
            `SELECT id FROM Attendance WHERE classId = ? AND studentId = ?`,
            [classId, attendance.studentId]
          );

          if (existingAttendance && existingAttendance.length > 0) {
            // Actualizar el registro existente
            await connection.query(
              `UPDATE Attendance 
               SET status = ?, timeAttendance = ?, updatedAt = NOW() 
               WHERE id = ?`,
              [
                attendance.status || 'absent',
                attendance.timeAttendance || 0,
                existingAttendance[0].id
              ]
            );
          } else {
            // Crear un nuevo registro
            await connection.query(
              `INSERT INTO Attendance (
                classId, studentId, status, timeAttendance, date, createdAt, updatedAt
              ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
              [
                classId,
                attendance.studentId,
                attendance.status || 'absent',
                attendance.timeAttendance || 0,
                classDate
              ]
            );
          }
        }

        // Obtener información del grupo para actualizar el porcentaje de asistencia
        const [classInfo] = await connection.query(
          `SELECT groupId FROM Class WHERE id = ?`,
          [classId]
        );

        if (classInfo && classInfo.length > 0) {
          // Actualizar porcentajes de asistencia para todos los alumnos con asistencias actualizadas
          for (const attendance of updateData.attendances) {
            if (attendance.studentId) {
              await AttendanceModel.updateAttendancePercentage(
                connection,
                attendance.studentId,
                classInfo[0].groupId
              );
            }
          }
        }
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error('Error en ScheduleModel.updateClass:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = { ScheduleModel }
