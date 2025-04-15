const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

class GroupModel {
  static async create(groupData) {
    try {
      const { students, ...groupInfo } = groupData

      // Convertir las fechas a objetos Date
      if (groupInfo.startDate) {
        groupInfo.startDate = new Date(groupInfo.startDate)
      }
      if (groupInfo.endDate) {
        groupInfo.endDate = new Date(groupInfo.endDate)
      }

      // Buscar el estado por defecto si no se proporciona statusId
      if (!groupInfo.statusId) {
        const defaultStatus = await prisma.groupStatus.findFirst({
          where: { isDefault: true }
        })
        if (defaultStatus) {
          groupInfo.statusId = defaultStatus.id
        }
      }

      // Buscar el estado activo por defecto para estudiantes
      const defaultStudentStatus = await prisma.studentStatus.findFirst({
        where: { isDefault: true }
      })

      if (!defaultStudentStatus) {
        throw new Error('No se encontró un estado por defecto para estudiantes')
      }

      const group = await prisma.group.create({
        data: {
          ...groupInfo,
          students: students
            ? {
                create: students.map((studentId) => ({
                  student: { connect: { id: studentId } },
                  status: { connect: { id: defaultStudentStatus.id } }
                }))
              }
            : undefined
        },
        include: {
          teacher: true,
          language: true,
          module: true,
          modality: true,
          status: true,
          company: true,
          students: {
            include: {
              student: true,
              status: true
            }
          }
        }
      })

      return group
    } catch (error) {
      console.error('Error en GroupModel.create:', error)
      throw error
    }
  }

  static async getAll() {
    try {
      const groups = await prisma.group.findMany({
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          teacher: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          language: {
            select: {
              id: true,
              name: true
            }
          },
          module: {
            select: {
              id: true,
              name: true
            }
          },
          modality: {
            select: {
              id: true,
              name: true
            }
          },
          status: {
            select: {
              id: true,
              name: true
            }
          },
          students: {
            select: {
              student: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true
                }
              },
              status: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      })
      return groups
    } catch (error) {
      console.error('Error en GroupModel.getAll:', error)
      throw error
    }
  }

  static async getById(id) {
    try {
      const group = await prisma.group.findUnique({
        where: { id },
        include: {
          teacher: true,
          language: true,
          module: true,
          modality: true,
          status: true,
          company: true,
          students: {
            include: {
              student: true,
              status: true
            }
          }
        }
      })
      return group
    } catch (error) {
      console.error('Error en GroupModel.getById:', error)
      throw error
    }
  }

  static async update(id, groupData) {
    try {
      const { students, ...groupInfo } = groupData

      const group = await prisma.group.update({
        where: { id },
        data: groupInfo,
        include: {
          teacher: true,
          language: true,
          module: true,
          modality: true,
          status: true,
          company: true,
          students: {
            include: {
              student: true,
              status: true
            }
          }
        }
      })
      return group
    } catch (error) {
      console.error('Error en GroupModel.update:', error)
      throw error
    }
  }

  static async delete(id) {
    try {
      // Primero eliminamos las relaciones con estudiantes
      await prisma.groupStudent.deleteMany({
        where: { groupId: id }
      })

      // Luego eliminamos el grupo
      const group = await prisma.group.delete({
        where: { id }
      })
      return group
    } catch (error) {
      console.error('Error en GroupModel.delete:', error)
      throw error
    }
  }

  static async addStudents(groupId, studentIds) {
    try {
      // Buscar el estado activo por defecto para estudiantes
      const defaultStudentStatus = await prisma.studentStatus.findFirst({
        where: { isDefault: true }
      })

      if (!defaultStudentStatus) {
        throw new Error('No se encontró un estado por defecto para estudiantes')
      }

      const createStudents = studentIds.map((studentId) => ({
        student: { connect: { id: studentId } },
        status: { connect: { id: defaultStudentStatus.id } }
      }))

      const group = await prisma.group.update({
        where: { id: groupId },
        data: {
          students: {
            create: createStudents
          }
        },
        include: {
          students: {
            include: {
              student: true,
              status: true
            }
          }
        }
      })
      return group
    } catch (error) {
      console.error('Error en GroupModel.addStudents:', error)
      throw error
    }
  }

  static async removeStudent(groupId, studentId) {
    try {
      const group = await prisma.groupStudent.deleteMany({
        where: {
          AND: [{ groupId }, { studentId }]
        }
      })
      return group
    } catch (error) {
      console.error('Error en GroupModel.removeStudent:', error)
      throw error
    }
  }

  static async updateStudentStatus(groupId, studentId, statusId) {
    try {
      const group = await prisma.groupStudent.updateMany({
        where: {
          AND: [{ groupId }, { studentId }]
        },
        data: {
          statusId
        }
      })
      return group
    } catch (error) {
      console.error('Error en GroupModel.updateStudentStatus:', error)
      throw error
    }
  }
}

module.exports = { GroupModel }
