const {
  validateCompany,
  validatePartialCompany
} = require('../../schemas/company/company.js')
const { validateContact } = require('../../schemas/company/contacts.js')
const { validateSector } = require('../../schemas/company/sector.js')
const { validateCostCenter } = require('../../schemas/company/cost_center.js')

class CompanyController {
  constructor({ companyModel }) {
    this.companyModel = companyModel
  }

  create = async (req, res) => {
    try {
      const result = validateCompany(req.body)
      if (!result.success) {
        return res.status(400).json(result.error.issues)
      }
      const newCompany = await this.companyModel.create(result.data)
      res.status(201).json(newCompany)
    } catch (error) {
      console.error('Error completo al crear empresa:', error)
      res.status(500).json({
        error: 'Error al crear la empresa',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
  createFullCompany = async (req, res) => {
    try {
      const { companyData, contactData, costCenterData, sectorData } = req.body

      const companyValidationResult = validateCompany(companyData)
      const contactValidationResult = validateContact(contactData)
      const costCenterValidationResult = validateCostCenter(costCenterData)
      const sectorValidationResult = validateSector(sectorData)

      if (!companyValidationResult.success) {
        return res.status(400).json(companyValidationResult.error.issues)
      }
      if (!contactValidationResult.success) {
        return res.status(400).json(contactValidationResult.error.issues)
      }
      if (!costCenterValidationResult.success) {
        return res.status(400).json(costCenterValidationResult.error.issues)
      }
      if (!sectorValidationResult.success) {
        return res.status(400).json(sectorValidationResult.error.issues)
      }
      const newCompany = await this.companyModel.createWithRelations(
        companyValidationResult.data,
        contactValidationResult.data,
        costCenterValidationResult.data,
        sectorValidationResult.data
      )
      res.status(201).json(newCompany)
    } catch (error) {
      console.error('Error completo al crear empresa y sus relaciones:', error)
      res.status(500).json({
        error: 'Error al crear la empresa y sus relaciones',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
  getAll = async (req, res) => {
    try {
      const companies = await this.companyModel.getAll()
      if (!companies.length) {
        return res.status(200).json({
          success: true,
          data: [],
          message: 'No se encontraron empresas'
        })
      }

      res.status(200).json(companies)
    } catch (error) {
      console.error('Error completo al buscar empresas:', error)
      res.status(500).json({
        error: 'Error al buscar empresas',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
  getById = async (req, res) => {
    try {
      const { companyId } = req.params
      const companyData = await this.companyModel.getById(companyId)
      if (!companyData) {
        return res.status(404).json({ error: 'No se encontró la empresa' })
      }
      return res.json(companyData)
    } catch (error) {
      console.error('Error completo al buscar la empresa:', error)
      res.status(500).json({
        error: 'Error al buscar la empresa',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
  deleteById = async (req, res) => {
    try {
      const { companyId } = req.params
      const affectedRows = await this.companyModel.deleteById(companyId)
      if (affectedRows === 0) {
        return res
          .status(404)
          .json({ error: 'No se encontró la empresa que querés eliminar' })
      }
      return res.json({ message: 'Empresa eliminada correctamente' })
    } catch (error) {
      console.error('Error completo al eliminar la empresa:', error)
      res.status(500).json({
        error: 'Hubo un error al eliminar la empresa',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
  updateById = async (req, res) => {
    try {
      const result = validatePartialCompany(req.body)
      if (!result.success) {
        console.log(
          'Error al validar parcialmente la empresa',
          result.error.message
        )
        return res.status(400).json(result.error.issues)
      }
      const { companyId } = req.params
      const affectedRows = await this.companyModel.updateById(
        companyId,
        result.data
      )
      if (affectedRows === 0) {
        return res
          .status(404)
          .json({ error: 'No se pudo actualizar la empresa' })
      }
      return res.json({ message: 'Empresa actualizada correctamente' })
    } catch (error) {
      console.error('Error completo al actualizar la empresa:', error)
      res.status(500).json({
        error: 'Hubo un error al actualizar la empresa',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  }
}

module.exports = { CompanyController }
