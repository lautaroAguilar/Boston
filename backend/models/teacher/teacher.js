const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

class TeacherModel {
  static async createWithUser(teacherData, hashedPassword) {
    try {
      const createdData = await prisma.$transaction(async (tx) => {
        // 1. Crear el usuario
        const user = await tx.users.create({
          data: {
            first_name: teacherData.firstName,
            last_name: teacherData.lastName,
            email: teacherData.email,
            password: hashedPassword,
            role_id: 2, // ID del rol "docente"
            active: true
          }
        })

        // 2. Crear el profesor
        const teacher = await tx.teacher.create({
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
            userId: user.id,
            languages: {
              create: teacherData.languages?.map(langId => ({
                language: {
                  connect: { id: langId }
                }
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

        return { teacher, user }
      })

      return createdData
    } catch (error) {
      console.error('Error al crear el docente con usuario:', error)
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
          professionalCategory: true,
          user: {
            select: {
              active: true,
              last_login: true
            }
          }
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
          professionalCategory: true,
          user: {
            select: {
              active: true,
              last_login: true
            }
          }
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
          languages: {
            deleteMany: {},
            create: teacherData.languages?.map(langId => ({
              language: {
                connect: { id: langId }
              }
            })) || []
          }
        },
        include: {
          languages: {
            include: {
              language: true
            }
          },
          professionalCategory: true,
          user: {
            select: {
              active: true,
              last_login: true
            }
          }
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
      // Primero obtenemos el userId
      const teacher = await prisma.teacher.findUnique({
        where: { id: parseInt(teacherId) },
        select: { userId: true }
      })

      if (!teacher) {
        throw new Error('Docente no encontrado')
      }

      await prisma.$transaction(async (tx) => {
        // Eliminar las relaciones con idiomas
        await tx.teacherLanguages.deleteMany({
          where: { teacherId: parseInt(teacherId) }
        })

        // Eliminar el profesor
        await tx.teacher.delete({
          where: { id: parseInt(teacherId) }
        })

        // Si existe un usuario asociado, lo eliminamos
        if (teacher.userId) {
          await tx.users.delete({
            where: { id: teacher.userId }
          })
        }
      })

      return true
    } catch (error) {
      console.error('Error al eliminar el docente:', error)
      throw error
    }
  }
}

module.exports = { TeacherModel } 