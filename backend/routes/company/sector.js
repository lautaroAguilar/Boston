import { Router } from 'express'
import { SectorController } from '../../controllers/company/sector.js'
import { SectorModel } from '../../models/company/sector.js'
import { authenticateToken } from '../../middlewares/auth.js'
export const sectorRouter = Router({ mergeParams: true })

const sectorController = new SectorController({ sectorModel: SectorModel })

sectorRouter.post('/', authenticateToken, (req, res) =>
  sectorController.create(req, res)
)
sectorRouter.get('/', authenticateToken, (req, res) =>
  sectorController.getAll(req, res)
)
sectorRouter.get('/:id', authenticateToken, (req, res) =>
  sectorController.getById(req, res)
)
sectorRouter.delete('/:id', authenticateToken, (req, res) =>
  sectorController.deleteById(req, res)
)
sectorRouter.patch('/:id', authenticateToken, (req, res) =>
  sectorController.updateById(req, res)
)
