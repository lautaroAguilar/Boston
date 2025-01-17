import { Router } from 'express'
import { SectorController } from '../../controllers/company/sector.js'
import { SectorModel } from '../../models/company/sector.js'
export const sectorRouter = Router({ mergeParams: true })

const sectorController = new SectorController({ sectorModel: SectorModel })

sectorRouter.post('/', (req, res) => sectorController.create(req, res))
sectorRouter.get('/', (req, res) => sectorController.getAll(req, res))
sectorRouter.get('/:id', (req, res) => sectorController.getById(req, res))
sectorRouter.delete('/:id', (req, res) => sectorController.deleteById(req, res))
sectorRouter.patch('/:id', (req, res) => sectorController.updateById(req, res))
