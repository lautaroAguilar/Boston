const {
  validateSchedule,
  validatePartialSchedule
} = require('../../schemas/schedule/schedule')
const {
  validateClass,
  validatePartialClass
} = require('../../schemas/class/class')

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
    const { companyId } = req.query
    try {
      const filters = {}
      if (companyId) {
        filters.companyId = companyId
      }

      const schedules = await this.scheduleModel.getAll(filters)
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

  getClassesByDateAndCompany = async (req, res) => {
    try {
      const { date, companyId } = req.query

      if (!date || !companyId) {
        return res.status(400).json({
          message: 'Seleccione una empresa por favor'
        })
      }

      const classes = await this.scheduleModel.getClassesByDateAndCompany(
        date,
        parseInt(companyId)
      )

      res.json({
        message: 'Clases obtenidas exitosamente',
        data: classes
      })
    } catch (error) {
      console.error(
        'Error en ScheduleController.getClassesByDateAndCompany:',
        error
      )
      res.status(500).json({
        message: 'Error al obtener las clases',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
  getClassesByGroup = async (req, res) => {
    try {
      const { groupId } = req.params
      const classes = await this.scheduleModel.getClassesByGroup(
        parseInt(groupId)
      )
      res.json({
        message: 'Clases obtenidas exitosamente',
        data: classes
      })
    } catch (error) {
      console.error('Error en ScheduleController.getClassesByGroup:', error)
      res.status(500).json({
        message: 'Error al obtener las clases',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }

  updateClass = async (req, res) => {
    try {
      const { classId } = req.params
      const updateData = req.body
      const validatedData = validatePartialClass(updateData)
      if (!validatedData.success) {
        return res.status(400).json({ message: 'Datos inválidos', errors: validatedData.error.issues })
      }

      if (!classId || Object.keys(validatedData.data).length === 0) {
        return res.status(400).json({ message: 'Datos insuficientes para actualizar la clase' })
      }
      await this.scheduleModel.updateClass(parseInt(classId), validatedData.data)
      res.json({ message: 'Clase actualizada exitosamente' })
    } catch (error) {
      console.error('Error en ScheduleController.updateClass:', error)
      res.status(500).json({
        message: 'Error al actualizar la clase',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
}

module.exports = { ScheduleController }
