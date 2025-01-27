import { validateLogin, validateRegister } from '../../schemas/auth/user.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

export class UserAuthController {
  constructor({ userAuthModel }) {
    this.userAuthModel = userAuthModel
  }
  register = async (req, res) => {
    const result = validateRegister(req.body)

    if (!result.success) {
      return res.status(400).json({ error: result.error.message })
    }
    const { name, email, password, role } = result.data
    try {
      const userExist = await this.userAuthModel.findOne(email)
      if (userExist) {
        return res
          .status(400)
          .json({ message: 'Ya existe un usuario con ese email' })
      }
      const saltRounds =
        process.env.NODE_ENV === 'production'
          ? parseInt(process.env.SALT_ROUNDS)
          : 1
      const hashedPassword = await bcrypt.hash(password, saltRounds)
      const newUser = await this.userAuthModel.register(
        name,
        email,
        hashedPassword,
        role
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
    const result = validateLogin(req.body)

    if (!result.success) {
      return res.status(400).json({ error: result.error.message })
    }
    const { email, password } = result.data
    try {
      const user = await this.userAuthModel.findOne(email)
      if (!user) {
        return res
          .status(401)
          .json({ message: 'No se encontró un usuario con ese email' })
      }
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Contraseña invalida' })
      }
      // Se genera el token de acceso y el de refresco, y lo guardamos en las cookies
      const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '15m'
      })
      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      )
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        path: '/'
      })
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        path: '/'
      })
      return res.status(200).json({ message: 'Login exitoso' })
    } catch (error) {
      return res.status(500).json({ message: 'Error al iniciar sesión', error })
    }
  }
  logout = async (req, res) => {
    res.clearCookie('refreshToken', { path: '/' })
    return res.status(200).json({ message: 'Logout exitoso' })
  }
  refreshToken = (req, res) => {
    const refreshToken = req.cookies.refreshToken

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

      return res.status(200).json({ accessToken: newAccessToken })
    } catch (error) {
      return res
        .status(403)
        .json({ message: 'Refresh token inválido o expirado' })
    }
  }
}
