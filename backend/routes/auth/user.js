const { Router } = require('express')
const { UserAuthController } = require('../../controllers/auth/user.js')
const { UserAuthModel } = require('../../models/auth/user.js')
const { authenticateToken } = require('../../middlewares/auth.js')

const userAuthRouter = Router()
const userAuthController = new UserAuthController({
  userAuthModel: UserAuthModel
})
userAuthRouter.get('/me', authenticateToken, userAuthController.me)
userAuthRouter.post('/register', userAuthController.register)
userAuthRouter.post('/login', userAuthController.login)
userAuthRouter.post('/logout', userAuthController.logout)
userAuthRouter.post('/refresh', userAuthController.refreshToken)

module.exports = { userAuthRouter }
