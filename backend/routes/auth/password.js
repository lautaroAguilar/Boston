const { Router } = require('express')
const { PasswordController } = require('../../controllers/auth/password.js')
const { UserAuthModel } = require('../../models/auth/user.js')
const { authenticateToken } = require('../../middlewares/auth.js')

const passwordRouter = Router()
const passwordController = new PasswordController({
  userAuthModel: UserAuthModel
})

// Ruta para cambiar contraseña (requiere autenticación)
passwordRouter.post('/change', authenticateToken, passwordController.changePassword)

// Ruta para restablecer contraseña (no requiere autenticación)
passwordRouter.post('/reset', passwordController.resetPassword)

module.exports = { passwordRouter } 