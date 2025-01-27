import { Router } from 'express'
import { authenticateToken } from '../../middlewares/auth.js'
import { UserController } from '../../controllers/users/users.js'
import { UserModel } from '../../models/users/users.js'

export const userRouter = Router()
const userController = new UserController({ userModel: UserModel })
userRouter.get('/', authenticateToken, userController.getAll)
userRouter.get('/:id', authenticateToken, userController.getById)
userRouter.delete('/:id', authenticateToken, userController.deleteById)
userRouter.patch('/:id', authenticateToken, userController.updateById)
