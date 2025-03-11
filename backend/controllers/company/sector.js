const {
  validateSector,
  validatePartialSector
} = require('../../schemas/company/sector.js')

class SectorController {
  constructor({ sectorModel }) {
    this.sectorModel = sectorModel
  }

  create = async (req, res) => {
    const { companyId } = req.params
    try {
      const result = validateSector(req.body)
      if (!result.success) {
        return res.status(400).json(result.error.issues)
      }
      const newSector = await this.sectorModel.create(companyId, result.data)
      res.status(201).json(newSector)
    } catch (error) {
      console.log(error)
      res.status(500).json({ success: false, error: error.message })
    }
  }
  getAll = async (req, res) => {
    try {
      const { companyId } = req.params
      const sectors = await this.sectorModel.getAll(companyId)

      // Si no hay compañías, devuelve array vacío
      if (!sectors.length) {
        return res.status(200).json({
          success: true,
          data: [],
          message: 'No se encontraron sectores'
        })
      }

      res.status(200).json(sectors)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }
  getById = async (req, res) => {
    try {
      const { sectorId } = req.params
      const sectorData = await this.sectorModel.getById(sectorId)
      if (!sectorData) {
        return res.status(404).json({ error: 'No se encontró el sector' })
      }
      return res.json(sectorData)
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message })
    }
  }
  deleteById = async (req, res) => {
    try {
      const { sectorId } = req.params
      const affectedRows = await this.sectorModel.deleteById(sectorId)
      if (affectedRows === 0) {
        return res
          .status(404)
          .json({ error: 'No se encontró el sector que querés eliminar' })
      }
      return res.json({ message: 'Sector eliminado correctamente' })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ success: false, error: error.message })
    }
  }
  updateById = async (req, res) => {
    try {
      const result = validatePartialSector(req.body)
      if (!result.success) {
        console.log(
          'Error al validar parcialmente el sector',
          result.error.message
        )
        return res.status(400).json(result.error.issues)
      }
      const { sectorId } = req.params
      const affectedRows = await this.sectorModel.updateById(
        sectorId,
        result.data
      )
      if (affectedRows === 0) {
        return res
          .status(404)
          .json({ error: 'No se pudo actualizar el sector' })
      }
      return res.json({ message: 'Sector actualizado correctamente' })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ success: false, error: error.message })
    }
  }
}
module.exports = { SectorController }
