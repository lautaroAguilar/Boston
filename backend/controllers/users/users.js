const { validatePartialRegister } = require('../../schemas/auth/user.js')

class UserController {
  constructor({ userModel }) {
    this.userModel = userModel
  }
  getAll = async (req, res) => {
    try {
      const users = await this.userModel.getAll()
      if (!users.length) {
        return res
          .status(200)
          .json({ data: [], message: 'No se encontraron usuarios' })
      }
      res.status(200).json(users)
    } catch (error) {
      res.status(500).json({
        error: 'Error al buscar usuarios',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
  getById = async (req, res) => {
    try {
      const { id } = req.params
      const userData = await this.userModel.getById(id)
      if (!userData) {
        return res.status(404).json({ error: 'No se encontró el usuario' })
      }
      return res.json(userData)
    } catch (error) {
      return res.status(500).json({
        error: 'Error al buscar el usuario',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
  deleteById = async (req, res) => {
    try {
      const { id } = req.params
      const affectedRows = await this.userModel.deleteById(id)
      if (affectedRows === 0) {
        return res
          .status(404)
          .json({ error: 'No se encontró el usuario que deseas eliminar' })
      }
      return res.json({ message: 'Usuario eliminado correctamente' })
    } catch (error) {
      return res.status(500).json({
        error: 'Error al eliminar el usuario',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
  updateById = async (req, res) => {
    try {
      const result = validatePartialRegister(req.body)
      if (!result.success) {
        console.error('Error de validación al actualizar usuario:', {
          issues: result.error.message,
          body: req.body
        })
        return res.status(400).json({ error: JSON.parse(result.error.message) })
      }

      const { id } = req.params
      const affectedRows = await this.userModel.updateById(id, result.data)
      if (affectedRows === 0) {
        return res
          .status(404)
          .json({ error: 'No se encontró el usuario que deseas actualizar' })
      }
      res.status(201).json({ message: 'Usuario actualizado correctamente' })
    } catch (error) {
      return res.status(500).json({
        error: 'Error al actualizar el usuario',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
}

module.exports = { UserController }
