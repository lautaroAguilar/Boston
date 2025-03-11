const { Router } = require('express')
const { authenticateToken } = require('../../middlewares/auth.js')
const { StudentsController } = require('../../controllers/students/students.js')
const { StudentsModel } = require('../../models/students/students.js')

const studentsRouter = Router()
const studentsController = new StudentsController({
  studentsModel: StudentsModel
})

studentsRouter.post('/', authenticateToken, studentsController.create)
studentsRouter.get('/', authenticateToken, studentsController.getAll)
studentsRouter.get('/:id', authenticateToken, studentsController.getById)
studentsRouter.delete('/:id', authenticateToken, studentsController.deleteById)
studentsRouter.patch('/:id', authenticateToken, studentsController.updateById)

module.exports = { studentsRouter }
