import { Router } from 'express'
import { UserAuthController } from '../../controllers/auth/user.js'
import { UserAuthModel } from '../../models/auth/user.js'
import { authenticateToken } from '../../middlewares/auth.js'

export const userAuthRouter = Router()
const userAuthController = new UserAuthController({
  userAuthModel: UserAuthModel
})
userAuthRouter.get('/me', authenticateToken, userAuthController.me)
userAuthRouter.post('/register', userAuthController.register)
userAuthRouter.post('/login', userAuthController.login)
userAuthRouter.post('/logout', authenticateToken, userAuthController.logout)
userAuthRouter.post('/refresh', authenticateToken, userAuthController.refreshToken)
