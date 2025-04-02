const { Router } = require('express')
const { TeacherController } = require('../../controllers/teacher/teacher.js')
const { TeacherModel } = require('../../models/teacher/teacher.js')
const { authenticateToken } = require('../../middlewares/auth.js')

const teacherRouter = Router()
const teacherController = new TeacherController({
  teacherModel: TeacherModel
})

teacherRouter.get('/', authenticateToken, teacherController.getAll)
teacherRouter.get('/:id', authenticateToken, teacherController.getById)
teacherRouter.post('/', authenticateToken, teacherController.create)
teacherRouter.patch('/:id', authenticateToken, teacherController.updateById)
teacherRouter.delete('/:id', authenticateToken, teacherController.deleteById)

module.exports = { teacherRouter }
