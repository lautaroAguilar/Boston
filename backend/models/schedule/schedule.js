const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

class ScheduleModel {
  static async generateClasses(groupId, scheduleData, group) {
    const classes = []
    const startDate = new Date(group.startDate)
    const endDate = new Date(group.endDate)

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
            groupId: groupId,
            teacherId: group.teacherId,
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
    try {
      // Iniciamos una transacción
      return await prisma.$transaction(async (tx) => {
        // Primero obtenemos el grupo para acceder a sus fechas
        const group = await tx.group.findUnique({
          where: { id: parseInt(groupId) }
        })

        if (!group) {
          throw new Error('Grupo no encontrado')
        }

        // Creamos el cronograma
        const schedule = await tx.schedule.create({
          data: {
            groupId: parseInt(groupId),
            days: scheduleData.days
          },
          include: {
            group: true
          }
        })

        // Generamos y creamos las clases
        const classes = await this.generateClasses(
          parseInt(groupId),
          scheduleData,
          group
        )
        await tx.class.createMany({
          data: classes
        })

        return schedule
      })
    } catch (error) {
      console.error('Error en ScheduleModel.create:', error)
      throw error
    }
  }
  static async getAll() {
    try {
      const schedules = await prisma.schedule.findMany({
        include: {
          group: true
        }
      })
      return schedules
    } catch (error) {
      console.error('Error en ScheduleModel.getAll:', error)
      throw error
    }
  }
  static async getByGroupId(groupId) {
    try {
      const schedule = await prisma.schedule.findUnique({
        where: { groupId: parseInt(groupId) },
        include: {
          group: true
        }
      })
      return schedule
    } catch (error) {
      console.error('Error en ScheduleModel.getByGroupId:', error)
      throw error
    }
  }

  static async update(groupId, scheduleData) {
    try {
      // Iniciamos una transacción
      return await prisma.$transaction(async (tx) => {
        // Obtenemos el grupo
        const group = await tx.group.findUnique({
          where: { id: parseInt(groupId) }
        })

        if (!group) {
          throw new Error('Grupo no encontrado')
        }

        // Eliminamos todas las clases futuras del grupo
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        await tx.class.deleteMany({
          where: {
            groupId: parseInt(groupId),
            date: {
              gte: today
            }
          }
        })

        // Actualizamos el cronograma
        const schedule = await tx.schedule.update({
          where: { groupId: parseInt(groupId) },
          data: {
            days: scheduleData.days
          },
          include: {
            group: true
          }
        })

        // Generamos y creamos las nuevas clases
        const classes = await this.generateClasses(
          parseInt(groupId),
          scheduleData,
          group
        )
        await tx.class.createMany({
          data: classes
        })

        return schedule
      })
    } catch (error) {
      console.error('Error en ScheduleModel.update:', error)
      throw error
    }
  }

  static async delete(groupId) {
    try {
      await prisma.$transaction(async (tx) => {
        // Eliminamos todas las clases futuras
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        await tx.class.deleteMany({
          where: {
            groupId: parseInt(groupId),
            date: {
              gte: today
            }
          }
        })

        // Eliminamos el cronograma
        await tx.schedule.delete({
          where: { groupId: parseInt(groupId) }
        })
      })
    } catch (error) {
      console.error('Error en ScheduleModel.delete:', error)
      throw error
    }
  }

  static async addSingleClass(groupId, classData) {
    try {
      return await prisma.$transaction(async (tx) => {
        // Verificamos que el grupo exista y obtenemos el teacherId
        const group = await tx.group.findUnique({
          where: { id: parseInt(groupId) }
        })

        if (!group) {
          throw new Error('Grupo no encontrado')
        }

        // Parseamos la fecha y hora
        const [hours, minutes] = classData.startTime.split(':').map(Number)
        const startTime = new Date(classData.date)
        startTime.setHours(hours, minutes, 0)

        // Calculamos la hora de fin
        const endTime = new Date(startTime)
        endTime.setMinutes(endTime.getMinutes() + classData.duration)

        // Verificamos si ya existe una clase en ese horario
        const existingClass = await tx.class.findFirst({
          where: {
            groupId: parseInt(groupId),
            date: new Date(classData.date),
            OR: [
              {
                AND: [
                  { startTime: { lte: startTime } },
                  { endTime: { gt: startTime } }
                ]
              },
              {
                AND: [
                  { startTime: { lt: endTime } },
                  { endTime: { gte: endTime } }
                ]
              }
            ]
          }
        })

        if (existingClass) {
          throw new Error('Ya existe una clase programada en ese horario')
        }

        // Creamos la nueva clase
        const newClass = await tx.class.create({
          data: {
            groupId: parseInt(groupId),
            teacherId: group.teacherId,
            date: new Date(classData.date),
            startTime,
            endTime
          }
        })

        return newClass
      })
    } catch (error) {
      console.error('Error en ScheduleModel.addSingleClass:', error)
      throw error
    }
  }
}

module.exports = { ScheduleModel }
