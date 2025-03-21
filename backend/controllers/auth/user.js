const {
  validateLogin,
  validateRegister
} = require('../../schemas/auth/user.js')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

class UserAuthController {
  constructor({ userAuthModel }) {
    this.userAuthModel = userAuthModel
  }
  register = async (req, res) => {
    try {
      const result = validateRegister(req.body)
      if (!result.success) {
        return res.status(400).json(result.error.issues)
      }
      const { first_name, last_name, email, password, role_id, belongs_to } =
        result.data
      const userExist = await this.userAuthModel.findOne(email)
      if (userExist) {
        return res
          .status(400)
          .json([{ path: ['email'], message: 'Este email ya está en uso' }])
      }
      const saltRounds =
        process.env.NODE_ENV === 'production'
          ? parseInt(process.env.SALT_ROUNDS)
          : 1
      const hashedPassword = await bcrypt.hash(password, saltRounds)
      const newUser = await this.userAuthModel.register(
        first_name,
        last_name,
        email,
        hashedPassword,
        role_id,
        belongs_to
      )
      return res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: newUser
      })
    } catch (error) {
      return res
        .status(500)
        .json({ message: 'Hubo un error al registrar el usuario' })
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
      const isProduction = process.env.NODE_ENV === 'production'
      const refreshTokenOptions = {
        httpOnly: true,
        secure: isProduction, // true en producción, false en desarrollo
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 días
      }

      const accessTokenOptions = {
        httpOnly: true,
        secure: isProduction, // true en producción, false en desarrollo
        maxAge: 1000 * 60 * 15 // 15 minutos
      }
      if (isProduction) {
        // En producción: configuración para subdominios
        refreshTokenOptions.sameSite = 'Lax'
        refreshTokenOptions.domain = 'boston-test.vercel.app'

        accessTokenOptions.sameSite = 'Lax'
        accessTokenOptions.domain = 'boston-test.vercel.app'
      } else {
        // En desarrollo: configuración para localhost
        refreshTokenOptions.sameSite = 'Lax'
        accessTokenOptions.sameSite = 'Lax'
      }

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
      res.cookie('refresh_token', refreshToken, refreshTokenOptions)
      res
        .cookie('access_token', accessToken, accessTokenOptions)
        .status(200)
        .json({ message: 'Login exitoso' })
    } catch (error) {
      return res.status(500).json({ message: 'Error al iniciar sesión', error })
    }
  }
  logout = async (req, res) => {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
      path: '/'
    })

    res.clearCookie('access_token', {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
      path: '/'
    })
    return res.status(200).json({ message: 'Logout exitoso' })
  }
  refreshToken = (req, res) => {
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
      const isProduction = process.env.NODE_ENV === 'production'
      const accessTokenOptions = {
        httpOnly: true,
        secure: isProduction, 
        maxAge: 1000 * 60 * 15 
      }
      if (isProduction) {
        accessTokenOptions.sameSite = 'Lax'
        accessTokenOptions.domain = 'boston-test.vercel.app'
      } else {
        accessTokenOptions.sameSite = 'Lax'
      }
      res
        .cookie('access_token', newAccessToken, accessTokenOptions)
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
      console.error(error)
      return res.status(500).json({
        message:
          'Error interno del servidor al intentar buscar el usuario activo'
      })
    }
  }
}

module.exports = { UserAuthController }
