import {
  validateCostCenter,
  validatePartialCostCenter,
} from '../../schemas/company/cost_center.js'

export class CostCenterController {
  constructor({ costCenterModel }) {
    this.costCenterModel = costCenterModel
  }

  create = async (req, res) => {
    const companyId = req.params.id
    const result = validateCostCenter(req.body)

    if (!result.success) {
      return res
        .status(400)
        .json({ success: false, error: JSON.parse(result.error.message) })
    }

    try {
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
      const costCenters = await this.costCenterModel.getAll()

      // Si no hay compañías, devuelve array vacío
      if (!costCenters.length) {
        return res.status(200).json({
          success: true,
          data: [],
          message: 'No se encontraron los centros de costos',
        })
      }

      res.status(200).json(costCenters)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }
  getById = async (req, res) => {
    try {
      const { id } = req.params
      const costCenterData = await this.costCenterModel.getById(id)
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
      const { id } = req.params
      const affectedRows = await this.costCenterModel.deleteById(id)
      if (affectedRows === 0) {
        return res.status(404).json({
          error: 'No se encontró el centro de costo que querés eliminar',
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
      const { id } = req.params
      const data = validatePartialCostCenter(req.body)
      const affectedRows = await this.costCenterModel.updateById(id, data)
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
