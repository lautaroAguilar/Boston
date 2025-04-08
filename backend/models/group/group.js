const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

class GroupModel {
  static async create(groupData) {
    try {
      const { students, ...groupInfo } = groupData

      const group = await prisma.group.create({
        data: {
          ...groupInfo,
          students: students
            ? {
                create: students.map((studentId) => ({
                  student: { connect: { id: studentId } },
                  status: { connect: { id: 1 } } // Asumiendo que 1 es el ID para "Activo"
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
      return await prisma.group.findMany({
        include: {
          teacher: true,
          language: true,
          module: true,
          modality: true,
          status: true,
          students: {
            include: {
              student: true,
              status: true
            }
          }
        }
      })
    } catch (error) {
      console.error('Error en GroupModel.getAll:', error)
      throw error
    }
  }

  static async getById(id) {
    try {
      return await prisma.group.findUnique({
        where: { id },
        include: {
          teacher: true,
          language: true,
          module: true,
          modality: true,
          status: true,
          students: {
            include: {
              student: true,
              status: true
            }
          }
        }
      })
    } catch (error) {
      console.error('Error en GroupModel.getById:', error)
      throw error
    }
  }

  static async update(id, groupData) {
    try {
      const { students, ...groupInfo } = groupData

      return await prisma.group.update({
        where: { id },
        data: groupInfo,
        include: {
          teacher: true,
          language: true,
          module: true,
          modality: true,
          status: true,
          students: {
            include: {
              student: true,
              status: true
            }
          }
        }
      })
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
      return await prisma.group.delete({
        where: { id }
      })
    } catch (error) {
      console.error('Error en GroupModel.delete:', error)
      throw error
    }
  }

  static async addStudents(groupId, studentIds) {
    try {
      const createStudents = studentIds.map((studentId) => ({
        student: { connect: { id: studentId } },
        status: { connect: { id: 1 } } // Asumiendo que 1 es el ID para "Activo"
      }))

      return await prisma.group.update({
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
    } catch (error) {
      console.error('Error en GroupModel.addStudents:', error)
      throw error
    }
  }

  static async removeStudent(groupId, studentId) {
    try {
      return await prisma.groupStudent.deleteMany({
        where: {
          AND: [{ groupId }, { studentId }]
        }
      })
    } catch (error) {
      console.error('Error en GroupModel.removeStudent:', error)
      throw error
    }
  }

  static async updateStudentStatus(groupId, studentId, statusId) {
    try {
      return await prisma.groupStudent.updateMany({
        where: {
          AND: [{ groupId }, { studentId }]
        },
        data: {
          statusId
        }
      })
    } catch (error) {
      console.error('Error en GroupModel.updateStudentStatus:', error)
      throw error
    }
  }
}

module.exports = { GroupModel }
