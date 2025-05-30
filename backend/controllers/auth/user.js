const {
  validateLogin,
  validateRegister
} = require('../../schemas/auth/user.js')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const {
  generateTemporaryPassword
} = require('../../utils/passwordGenerator.js')
const { MailService } = require('../../services/mail.js')

class UserAuthController {
  constructor({ userAuthModel }) {
    this.userAuthModel = userAuthModel
    this.mailService = new MailService()
  }
  register = async (req, res) => {
    try {
      const result = validateRegister(req.body)
      if (!result.success) {
        return res.status(400).json(result.error.issues)
      }
      const { first_name, last_name, email, role_id, belongs_to } = result.data

      // Si no se proporciona contraseña o se indica generar temporal, crear una
      let password = result.data.password
      let isTemporaryPassword = result.data.is_temp_password === true

      if (!password || isTemporaryPassword) {
        password = generateTemporaryPassword()
        isTemporaryPassword = true
      }

      const userExist = await this.userAuthModel.findOne(email)
      if (userExist) {
        return res
          .status(400)
          .json([{ path: ['email'], message: 'Este email ya está en uso' }])
      }

      const saltRounds = process.env.NODE_ENV === 'production'
        ? parseInt(process.env.SALT_ROUNDS)
        : 1
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      const newUser = await this.userAuthModel.register(
        first_name,
        last_name,
        email,
        hashedPassword,
        role_id,
        belongs_to,
        isTemporaryPassword
      )

      // Enviar email con contraseña temporal si corresponde
      if (isTemporaryPassword) {
        const emailSent = await this.mailService.sendTemporaryPassword(email, first_name, password)
        if (!emailSent) {
          return res.status(500).json({
            error: 'Error al enviar el email con la contraseña temporal'
          });
        }
      }

      return res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: newUser
      })
    } catch (error) {
      return res.status(500).json({
        error: 'Hubo un error al registrar el usuario',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
  login = async (req, res) => {
    try {
      const result = validateLogin(req.body)

      if (!result.success) {
        return res.status(400).json(result.error.issues)
      }
      const { email, password } = result.data
      const user = await this.userAuthModel.findOne(email)
      if (!user) {
        return res
          .status(401)
          .json({ message: 'No se encontró un usuario con ese email' })
      }
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        return res
          .status(401)
          .json([{ path: ['password'], message: 'Contraseña incorrecta' }])
      }
      // Se genera el token de acceso y el de refresco, y lo guardamos en las cookies
      const accessToken = jwt.sign(
        {
          id: user.id
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '15m'
        }
      )
      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      )
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'None',
        maxAge: 1000 * 60 * 60 * 24 * 7,
        path: '/'
      })
      res
        .cookie('access_token', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'None',
          maxAge: 1000 * 60 * 15,
          path: '/'
        })
        .status(200)
        .json({
          message: 'Login exitoso',
          is_temp_password: user.is_temp_password
        })
    } catch (error) {
      return res.status(500).json({
        error: 'Error al iniciar sesión',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
  logout = async (req, res) => {
    try {
      res.clearCookie('refresh_token', {
        httpOnly: true,
        sameSite: 'None',
        secure: process.env.NODE_ENV === 'production',
        path: '/'
      })

      res.clearCookie('access_token', {
        httpOnly: true,
        sameSite: 'None',
        secure: process.env.NODE_ENV === 'production',
        path: '/'
      })
      return res.status(200).json({ message: 'Logout exitoso' })
    } catch (error) {
      return res.status(500).json({
        error: 'Error al cerrar sesión',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
  refreshToken = async (req, res) => {
    const refreshToken = req.cookies.refresh_token

    if (!refreshToken) {
      return res.status(401).json({ message: 'No hay refresh token' })
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
      const newAccessToken = jwt.sign(
        { id: decoded.id },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      )
      res
        .cookie('access_token', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'None',
          maxAge: 1000 * 60 * 15,
          path: '/'
        })
        .status(200)
        .json({ message: 'Tienes un nuevo token, felicidades.' })
    } catch (error) {
      return res
        .status(403)
        .json({ message: 'Refresh token inválido o expirado' })
    }
  }
  me = async (req, res) => {
    try {
      const userInfo = {
        userId: req.user.id
      }
      return res.status(200).json(userInfo)
    } catch (error) {
      return res.status(500).json({
        message:
          'Error interno del servidor al intentar buscar el usuario activo'
      })
    }
  }
}

module.exports = { UserAuthController }
