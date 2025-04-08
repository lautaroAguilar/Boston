const express = require('express')
const groupRouter = express.Router()
const { GroupController } = require('../../controllers/group/group.js')
const { GroupModel } = require('../../models/group/group.js')
const { authenticateToken } = require('../../middlewares/auth.js')

const groupController = new GroupController({ groupModel: GroupModel })

// Rutas CRUD básicas
groupRouter.post('/', authenticateToken, groupController.create)
groupRouter.get('/', authenticateToken, groupController.getAll)
groupRouter.get('/:id', authenticateToken, groupController.getById)
groupRouter.put('/:id', authenticateToken, groupController.update)
groupRouter.delete('/:id', authenticateToken, groupController.delete)

// Rutas para gestión de estudiantes
groupRouter.post(
  '/:id/students',
  authenticateToken,
  groupController.addStudents
)
groupRouter.delete(
  '/:groupId/students/:studentId',
  authenticateToken,
  groupController.removeStudent
)
groupRouter.put(
  '/:groupId/students/:studentId/status',
  authenticateToken,
  groupController.updateStudentStatus
)

module.exports = { groupRouter }
