const { TeacherModel } = require('../../models/teacher/teacher.js')
const { validateTeacher } = require('../../schemas/teacher/teacher.js')

class TeacherController {
  constructor({ teacherModel }) {
    this.teacherModel = teacherModel
  }

  create = async (req, res) => {
    try {
      const result = validateTeacher(req.body)

      if (!result.success) {
        return res.status(400).json({
          error: true,
          message: 'Error de validación',
          errors: result.error.issues
        })
      }

      const teacher = await this.teacherModel.create(result.data)
      res.status(201).json({
        error: false,
        message: 'Docente creado exitosamente',
        data: teacher
      })
    } catch (error) {
      console.error('Error en el controlador de creación de docente:', error)
      res.status(500).json({
        error: true,
        message: 'Error al crear el docente',
        errors: error.message
      })
    }
  }

  getAll = async (req, res) => {
    try {
      const teachers = await this.teacherModel.getAll()
      res.json({
        error: false,
        message: 'Docentes obtenidos exitosamente',
        data: teachers
      })
    } catch (error) {
      console.error('Error en el controlador de obtención de docentes:', error)
      res.status(500).json({
        error: true,
        message: 'Error al obtener los docentes',
        errors: error.message
      })
    }
  }

  getById = async (req, res) => {
    try {
      const { id } = req.params
      const teacher = await this.teacherModel.getById(id)

      if (!teacher) {
        return res.status(404).json({
          error: true,
          message: 'Docente no encontrado'
        })
      }

      res.json({
        error: false,
        message: 'Docente obtenido exitosamente',
        data: teacher
      })
    } catch (error) {
      console.error('Error en el controlador de obtención de docente:', error)
      res.status(500).json({
        error: true,
        message: 'Error al obtener el docente',
        errors: error.message
      })
    }
  }

  updateById = async (req, res) => {
    try {
      const { id } = req.params
      const result = validateTeacher(req.body)

      if (!result.success) {
        return res.status(400).json({
          error: true,
          message: 'Error de validación',
          errors: result.error.issues
        })
      }

      const teacher = await this.teacherModel.updateById(id, result.data)

      if (!teacher) {
        return res.status(404).json({
          error: true,
          message: 'Docente no encontrado'
        })
      }

      res.json({
        error: false,
        message: 'Docente actualizado exitosamente',
        data: teacher
      })
    } catch (error) {
      console.error('Error en el controlador de actualización de docente:', error)
      res.status(500).json({
        error: true,
        message: 'Error al actualizar el docente',
        errors: error.message
      })
    }
  }

  deleteById = async (req, res) => {
    try {
      const { id } = req.params
      const teacher = await this.teacherModel.deleteById(id)

      if (!teacher) {
        return res.status(404).json({
          error: true,
          message: 'Docente no encontrado'
        })
      }

      res.json({
        error: false,
        message: 'Docente eliminado exitosamente',
        data: teacher
      })
    } catch (error) {
      console.error('Error en el controlador de eliminación de docente:', error)
      res.status(500).json({
        error: true,
        message: 'Error al eliminar el docente',
        errors: error.message
      })
    }
  }
}

module.exports = { TeacherController }
