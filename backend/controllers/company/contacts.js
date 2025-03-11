const {
  validateContact,
  validatePartialContact
} = require('../../schemas/company/contacts.js')
class ContactController {
  constructor({ contactModel }) {
    this.contactModel = contactModel
  }

  create = async (req, res) => {
    const { companyId } = req.params
    try {
      const result = validateContact(req.body)
      if (!result.success) {
        return res.status(400).json(result.error.issues)
      }
      const newContact = await this.contactModel.create(companyId, result.data)
      res.status(201).json(newContact)
    } catch (error) {
      console.log(error)
      res.status(500).json({ success: false, error: error.message })
    }
  }
  getAll = async (req, res) => {
    try {
      const { companyId } = req.params
      const contacts = await this.contactModel.getAll(companyId)

      // Si no hay compañías, devuelve array vacío
      if (!contacts.length) {
        return res.status(200).json({
          success: true,
          data: [],
          message: 'No se encontraron contactos'
        })
      }

      res.status(200).json(contacts)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }
  getById = async (req, res) => {
    try {
      const { contactId } = req.params
      const contactData = await this.contactModel.getById(contactId)
      if (!contactData) {
        return res.status(404).json({ error: 'No se encontró el contacto' })
      }
      return res.json(contactData)
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message })
    }
  }
  deleteById = async (req, res) => {
    try {
      const { contactId } = req.params
      const affectedRows = await this.contactModel.deleteById(contactId)
      if (affectedRows === 0) {
        return res
          .status(404)
          .json({ error: 'No se encontró el contacto que querés eliminar' })
      }
      return res.json({ message: 'Contacto eliminado correctamente' })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ success: false, error: error.message })
    }
  }
  updateById = async (req, res) => {
    try {
      const result = validatePartialContact(req.body)
      if (!result.success) {
        console.log(
          'Error al validar parcialmente el contacto',
          result.error.message
        )
        return res.status(400).json(result.error.issues)
      }
      const { contactId } = req.params
      const affectedRows = await this.contactModel.updateById(
        contactId,
        result.data
      )
      if (affectedRows === 0) {
        return res
          .status(404)
          .json({ error: 'No se pudo actualizar el contacto' })
      }
      return res.json({ message: 'Contacto actualizado correctamente' })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ success: false, error: error.message })
    }
  }
}
module.exports = { ContactController }
