const { Router } = require('express')
const { SectorController } = require('../../controllers/company/sector.js')
const { SectorModel } = require('../../models/company/sector.js')
const { authenticateToken } = require('../../middlewares/auth.js')
const sectorRouter = Router({ mergeParams: true })

const sectorController = new SectorController({ sectorModel: SectorModel })

sectorRouter.post('/', authenticateToken, (req, res) =>
  sectorController.create(req, res)
)
sectorRouter.get('/', authenticateToken, (req, res) =>
  sectorController.getAll(req, res)
)
sectorRouter.get('/:sectorId', authenticateToken, (req, res) =>
  sectorController.getById(req, res)
)
sectorRouter.delete('/:sectorId', authenticateToken, (req, res) =>
  sectorController.deleteById(req, res)
)
sectorRouter.patch('/:sectorId', authenticateToken, (req, res) =>
  sectorController.updateById(req, res)
)
module.exports = { sectorRouter }
