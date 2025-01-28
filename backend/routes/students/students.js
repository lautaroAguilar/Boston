import { Router } from 'express'
import { authenticateToken } from '../../middlewares/auth.js'
import { StudentsController } from '../../controllers/students/students.js'
import { StudentsModel } from '../../models/students/students.js'

export const studentsRouter = Router()
const studentsController = new StudentsController({
  studentsModel: StudentsModel
})

studentsRouter.post('/', authenticateToken, studentsController.create)
studentsRouter.get('/', authenticateToken, studentsController.getAll)
studentsRouter.get('/:id', authenticateToken, studentsController.getById)
studentsRouter.delete('/:id', authenticateToken, studentsController.deleteById)
studentsRouter.patch('/:id', authenticateToken, studentsController.updateById)
