const express = require('express')
const { ScheduleController } = require('../../controllers/schedule/schedule.js')
const { ScheduleModel } = require('../../models/schedule/schedule.js')
const { authenticateToken } = require('../../middlewares/auth.js')
const scheduleRouter = express.Router()
const scheduleController = new ScheduleController({
  scheduleModel: ScheduleModel
})

// Crear cronograma para un grupo
scheduleRouter.post('/:groupId', authenticateToken, scheduleController.create)

// Obtener todos los cronogramas
scheduleRouter.get('/', authenticateToken, scheduleController.getAll)

// Obtener clases por fecha y compañía
scheduleRouter.get('/classes', authenticateToken, scheduleController.getClassesByDateAndCompany)

// Obtener cronograma de un grupo
scheduleRouter.get(
  '/:groupId',
  authenticateToken,
  scheduleController.getByGroupId
)

// Actualizar cronograma de un grupo
scheduleRouter.put('/:groupId', authenticateToken, scheduleController.update)

// Eliminar cronograma de un grupo
scheduleRouter.delete('/:groupId', authenticateToken, scheduleController.delete)

// Agregar una clase individual al cronograma
scheduleRouter.post('/:groupId/class', authenticateToken, scheduleController.addSingleClass)

module.exports = { scheduleRouter }
