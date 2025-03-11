const { Router } = require('express')
const { authenticateToken } = require('../../middlewares/auth.js')
const { UserController } = require('../../controllers/users/users.js')
const { UserModel } = require('../../models/users/users.js')

const userRouter = Router()
const userController = new UserController({ userModel: UserModel })
userRouter.get('/', authenticateToken, userController.getAll)
userRouter.get('/:id', authenticateToken, userController.getById)
userRouter.delete('/:id', authenticateToken, userController.deleteById)
userRouter.patch('/:id', authenticateToken, userController.updateById)

module.exports = { userRouter }
