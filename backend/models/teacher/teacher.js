const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

class TeacherModel {
  static async create(teacherData) {
    try {
      const teacher = await prisma.teacher.create({
        data: {
          firstName: teacherData.firstName,
          lastName: teacherData.lastName,
          email: teacherData.email,
          phone: teacherData.phone,
          CBU: teacherData.CBU,
          CUIT: teacherData.CUIT,
          professionalCategoryId: teacherData.professionalCategoryId,
          fictitiousSeniority: teacherData.fictitiousSeniority,
          bostonSeniority: teacherData.bostonSeniority,
          observations: teacherData.observations,
          userId: teacherData.userId,
          languages: {
            create: teacherData.languages?.map(languageId => ({
              languageId: languageId
            })) || []
          }
        },
        include: {
          languages: {
            include: {
              language: true
            }
          },
          professionalCategory: true
        }
      })
      return teacher
    } catch (error) {
      console.error('Error al crear el docente:', error)
      throw error
    }
  }

  static async getAll() {
    try {
      const teachers = await prisma.teacher.findMany({
        include: {
          languages: {
            include: {
              language: true
            }
          },
          professionalCategory: true
        },
        orderBy: {
          id: 'asc'
        }
      })
      return teachers
    } catch (error) {
      console.error('Error al obtener los docentes:', error)
      throw error
    }
  }

  static async getById(teacherId) {
    try {
      const teacher = await prisma.teacher.findUnique({
        where: { id: parseInt(teacherId) },
        include: {
          languages: {
            include: {
              language: true
            }
          },
          professionalCategory: true
        }
      })
      return teacher
    } catch (error) {
      console.error('Error al obtener el docente:', error)
      throw error
    }
  }

  static async updateById(teacherId, teacherData) {
    try {
      const teacher = await prisma.teacher.update({
        where: { id: parseInt(teacherId) },
        data: {
          firstName: teacherData.firstName,
          lastName: teacherData.lastName,
          email: teacherData.email,
          phone: teacherData.phone,
          CBU: teacherData.CBU,
          CUIT: teacherData.CUIT,
          professionalCategoryId: teacherData.professionalCategoryId,
          fictitiousSeniority: teacherData.fictitiousSeniority,
          bostonSeniority: teacherData.bostonSeniority,
          observations: teacherData.observations,
          userId: teacherData.userId,
          languages: {
            connect: teacherData.languages?.map(languageId => ({
              languageId: languageId
            })) || []
          }
        },
        include: {
          languages: {
            include: {
              language: true
            }
          },
          professionalCategory: true
        }
      })
      return teacher
    } catch (error) {
      console.error('Error al actualizar el docente:', error)
      throw error
    }
  }

  static async deleteById(teacherId) {
    try {
      const teacher = await prisma.teacher.delete({
        where: { id: parseInt(teacherId) }
      })
      return teacher
    } catch (error) {
      console.error('Error al eliminar el docente:', error)
      throw error
    }
  }
}

module.exports = { TeacherModel } 