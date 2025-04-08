const {
  validateGroup,
  validatePartialGroup
} = require('../../schemas/group/group')

class GroupController {
  constructor({ groupModel }) {
    this.groupModel = groupModel
  }
  create = async (req, res) => {
    try {
      const validatedData = await validateGroup(req.body)
      const group = await this.groupModel.create(validatedData)
      res.status(201).json({
        message: 'Grupo creado exitosamente',
        data: group
      })
    } catch (error) {
      console.error('Error en GroupController.create:', error)
      if (error.name === 'ZodError') {
        return res.status(400).json({
          message: 'Datos de entrada inválidos',
          errors: error.errors
        })
      }
      res.status(500).json({
        message: 'Error al crear el grupo',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  getAll = async (req, res) => {
    try {
      const groups = await this.groupModel.getAll()
      res.json({
        message: 'Grupos obtenidos exitosamente',
        data: groups
      })
    } catch (error) {
      console.error('Error en GroupController.getAll:', error)
      res.status(500).json({
        message: 'Error al obtener los grupos',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  getById = async (req, res) => {
    try {
      const { id } = req.params
      const group = await this.groupModel.getById(parseInt(id))

      if (!group) {
        return res.status(404).json({
          message: 'Grupo no encontrado'
        })
      }

      res.json({
        message: 'Grupo obtenido exitosamente',
        data: group
      })
    } catch (error) {
      console.error('Error en GroupController.getById:', error)
      res.status(500).json({
        message: 'Error al obtener el grupo',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  update = async (req, res) => {
    try {
      const { id } = req.params
      const validatedData = await validatePartialGroup(req.body)
      const group = await this.groupModel.update(parseInt(id), validatedData)

      if (!group) {
        return res.status(404).json({
          message: 'Grupo no encontrado'
        })
      }

      res.json({
        message: 'Grupo actualizado exitosamente',
        data: group
      })
    } catch (error) {
      console.error('Error en GroupController.update:', error)
      if (error.name === 'ZodError') {
        return res.status(400).json({
          message: 'Datos de entrada inválidos',
          errors: error.errors
        })
      }
      res.status(500).json({
        message: 'Error al actualizar el grupo',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  delete = async (req, res) => {
    try {
      const { id } = req.params
      await this.groupModel.delete(parseInt(id))
      res.json({
        message: 'Grupo eliminado exitosamente'
      })
    } catch (error) {
      console.error('Error en GroupController.delete:', error)
      res.status(500).json({
        message: 'Error al eliminar el grupo',
        error: error.message
      })
    }
  }

  addStudents = async (req, res) => {
    try {
      const { id } = req.params
      const { studentIds } = req.body

      if (!Array.isArray(studentIds) || studentIds.length === 0) {
        return res.status(400).json({
          message: 'Se requiere un array no vacío de IDs de estudiantes'
        })
      }

      const group = await this.groupModel.addStudents(parseInt(id), studentIds)
      res.json({
        message: 'Estudiantes agregados exitosamente',
        data: group
      })
    } catch (error) {
      console.error('Error en GroupController.addStudents:', error)
      res.status(500).json({
        message: 'Error al agregar estudiantes',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  removeStudent = async (req, res) => {
    try {
      const { groupId, studentId } = req.params
      await this.groupModel.removeStudent(
        parseInt(groupId),
        parseInt(studentId)
      )
      res.json({
        message: 'Estudiante removido exitosamente'
      })
    } catch (error) {
      console.error('Error en GroupController.removeStudent:', error)
      res.status(500).json({
        message: 'Error al remover el estudiante',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  updateStudentStatus = async (req, res) => {
    try {
      const { groupId, studentId } = req.params
      const { statusId } = req.body

      if (!statusId) {
        return res.status(400).json({
          message: 'Se requiere el ID del estado'
        })
      }

      await this.groupModel.updateStudentStatus(
        parseInt(groupId),
        parseInt(studentId),
        parseInt(statusId)
      )

      res.json({
        message: 'Estado del estudiante actualizado exitosamente'
      })
    } catch (error) {
      console.error('Error en GroupController.updateStudentStatus:', error)
      res.status(500).json({
        message: 'Error al actualizar el estado del estudiante',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
}

module.exports = { GroupController }
