const {
  validateCostCenter,
  validatePartialCostCenter
} = require('../../schemas/company/cost_center.js')

class CostCenterController {
  constructor({ costCenterModel }) {
    this.costCenterModel = costCenterModel
  }

  create = async (req, res) => {
    const { companyId } = req.params
    try {
      const result = validateCostCenter(req.body)
      if (!result.success) {
        return res.status(400).json(result.error.issues)
      }
      const newCostCenter = await this.costCenterModel.create(
        companyId,
        result.data
      )
      res.status(201).json(newCostCenter)
    } catch (error) {
      console.log(error)
      res.status(500).json({ success: false, error: error.message })
    }
  }

  getAll = async (req, res) => {
    try {
      const { companyId } = req.params
      const costCenters = await this.costCenterModel.getAll(companyId)

      // Si no hay compañías, devuelve array vacío
      if (!costCenters.length) {
        return res.status(200).json({
          success: true,
          data: [],
          message: 'No se encontraron los centros de costos'
        })
      }

      res.status(200).json(costCenters)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }

  getById = async (req, res) => {
    try {
      const { costCenterId } = req.params
      const costCenterData = await this.costCenterModel.getById(costCenterId)
      if (!costCenterData) {
        return res
          .status(404)
          .json({ error: 'No se encontró el centro de costo' })
      }
      return res.json(costCenterData)
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message })
    }
  }

  deleteById = async (req, res) => {
    try {
      const { costCenterId } = req.params
      const affectedRows = await this.costCenterModel.deleteById(costCenterId)
      if (affectedRows === 0) {
        return res.status(404).json({
          error: 'No se encontró el centro de costo que querés eliminar'
        })
      }
      return res.json({ message: 'Centro de costo eliminado correctamente' })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ success: false, error: error.message })
    }
  }

  updateById = async (req, res) => {
    try {
      const result = validatePartialCostCenter(req.body)
      if (!result.success) {
        console.log(
          'Error al validar parcialmente el centro de costo',
          result.error.message
        )
        return res.status(400).json(result.error.issues)
      }
      const { costCenterId } = req.params
      const affectedRows = await this.costCenterModel.updateById(
        costCenterId,
        result.data
      )
      if (affectedRows === 0) {
        return res
          .status(404)
          .json({ error: 'No se pudo actualizar el centro de costo' })
      }
      return res.json({ message: 'Centro de costo actualizada correctamente' })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ success: false, error: error.message })
    }
  }
}
module.exports = { CostCenterController }
