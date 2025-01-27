import {
  validateSector,
  validatePartialSector
} from '../../schemas/company/sector.js'

export class SectorController {
  constructor({ sectorModel }) {
    this.sectorModel = sectorModel
  }

  create = async (req, res) => {
    const companyId = req.params.id
    const result = validateSector(req.body)

    if (!result.success) {
      return res
        .status(400)
        .json({ success: false, error: JSON.parse(result.error.message) })
    }

    try {
      const newSector = await this.sectorModel.create(companyId, result.data)
      res.status(201).json(newSector)
    } catch (error) {
      console.log(error)
      res.status(500).json({ success: false, error: error.message })
    }
  }
  getAll = async (req, res) => {
    try {
      const sectors = await this.sectorModel.getAll()

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
      const { id } = req.params
      const sectorData = await this.sectorModel.getById(id)
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
      const { id } = req.params
      const affectedRows = await this.sectorModel.deleteById(id)
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
    const result = validatePartialSector(req.body)
    if (!result.success) {
      console.log('Error al validar parcialmente el sector', result.error.message)
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }
    try {
      const { id } = req.params
      const affectedRows = await this.sectorModel.updateById(id, result.data)
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
