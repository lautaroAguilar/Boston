const { validatePartialRegister } = require('../../schemas/auth/user.js')

class UserController {
  constructor({ userModel }) {
    this.userModel = userModel
  }
  getAll = async (req, res) => {
    try {
      const users = await this.userModel.getAll()
      if (!users.length) {
        res
          .status(200)
          .json({ data: [], message: 'No se encontraron empresas' })
      }
      res.status(200).json(users)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al buscar usuarios',
        error
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
      return res.status(500).json({ error: 'Error al buscar el usuario' })
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
      return res.json(affectedRows)
    } catch (error) {
      return res.status(500).json({ error: 'Error al eliminar el usuario' })
    }
  }
  updateById = async (req, res) => {
    const result = validatePartialRegister(req.body)
    if (!result.success) {
      console.log(
        'Error al validar parcialmente el usuario',
        result.error.message
      )
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }
    try {
      const { id } = req.params
      const affectedRows = await this.userModel.updateById(id, result.data)
      if (affectedRows === 0) {
        return res
          .status(404)
          .json({ error: 'No se encontró el usuario que deseas eliminar' })
      }
      res.status(201).json({ message: 'Se actualizo correctamente el usuario' })
    } catch (error) {
      return res.status(500).json({ error: 'Error al actualizar el usuario' })
    }
  }
}

module.exports = { UserController }
