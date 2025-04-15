const {
  validateSchedule,
  validatePartialSchedule
} = require('../../schemas/schedule/schedule')
const { validateClass } = require('../../schemas/class/class')

class ScheduleController {
  constructor({ scheduleModel }) {
    this.scheduleModel = scheduleModel
  }

  create = async (req, res) => {
    try {
      const { groupId } = req.params
      const validatedData = validateSchedule(req.body)

      if (!validatedData.success) {
        return res.status(400).json(validatedData.error.issues)
      }

      const schedule = await this.scheduleModel.create(
        groupId,
        validatedData.data
      )
      res.status(201).json({
        message: 'Cronograma creado exitosamente',
        data: schedule
      })
    } catch (error) {
      res.status(500).json({
        error: 'Error al crear el cronograma',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
  getAll = async (req, res) => {
    try {
      const schedules = await this.scheduleModel.getAll()
      res.json({
        message: 'Cronogramas obtenidos exitosamente',
        data: schedules
      })
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener los cronogramas',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
  getByGroupId = async (req, res) => {
    try {
      const { groupId } = req.params
      const schedule = await this.scheduleModel.getByGroupId(parseInt(groupId))

      if (!schedule) {
        return res.status(404).json({
          message: 'Cronograma no encontrado'
        })
      }

      res.json({
        message: 'Cronograma obtenido exitosamente',
        data: schedule
      })
    } catch (error) {
      console.error('Error en ScheduleController.getByGroupId:', error)
      res.status(500).json({
        message: 'Error al obtener el cronograma',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  update = async (req, res) => {
    try {
      const { groupId } = req.params
      const validatedData = validatePartialSchedule(req.body)

      if (!validatedData.success) {
        return res.status(400).json(validatedData.error.issues)
      }

      const schedule = await this.scheduleModel.update(
        parseInt(groupId),
        validatedData.data
      )
      res.json({
        message: 'Cronograma actualizado exitosamente',
        data: schedule
      })
    } catch (error) {
      console.error('Error en ScheduleController.update:', error)
      res.status(500).json({
        message: 'Error al actualizar el cronograma',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  delete = async (req, res) => {
    try {
      const { groupId } = req.params
      await this.scheduleModel.delete(parseInt(groupId))
      res.json({
        message: 'Cronograma eliminado exitosamente'
      })
    } catch (error) {
      console.error('Error en ScheduleController.delete:', error)
      res.status(500).json({
        message: 'Error al eliminar el cronograma',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  addSingleClass = async (req, res) => {
    try {
      const { groupId } = req.params
      const validatedData = validateClass(req.body)

      if (!validatedData.success) {
        return res.status(400).json({
          message: 'Datos de entrada inválidos',
          errors: validatedData.error.errors
        })
      }

      const result = await this.scheduleModel.addSingleClass(
        parseInt(groupId),
        validatedData.data
      )

      res.status(201).json({
        message: 'Clase agregada exitosamente',
        data: result
      })
    } catch (error) {
      console.error('Error en ScheduleController.addSingleClass:', error)
      res.status(500).json({
        message: 'Error al agregar la clase',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
}

module.exports = { ScheduleController }
