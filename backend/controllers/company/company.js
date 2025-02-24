import {
  validateCompany,
  validatePartialCompany
} from '../../schemas/company/company.js'

export class CompanyController {
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
      console.log(error)
      res.status(500).json({ error: error.message })
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
      res.status(500).json({
        success: false,
        message: 'Error al buscar empresas',
        error
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
      return res.status(500).json({ error: 'Error al buscar la empresa' })
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
      console.error(error)
      return res
        .status(500)
        .json({ error: 'Hubo un error al eliminar la empresa' })
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
      const affectedRows = await this.companyModel.updateById(companyId, result.data)
      if (affectedRows === 0) {
        return res
          .status(404)
          .json({ error: 'No se pudo actualizar la empresa' })
      }
      return res.json({ message: 'Empresa actualizada correctamente' })
    } catch (error) {
      console.error(error)
      return res
        .status(500)
        .json({ error: 'Hubo un error al actualizar la empresa' })
    }
  }
}
