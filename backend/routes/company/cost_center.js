import { Router } from 'express'
import { CostCenterController } from '../../controllers/company/cost_center.js'
import { CostCenterModel } from '../../models/company/cost_center.js'
export const costCenterRouter = Router({ mergeParams: true })

const costCenterController = new CostCenterController({
  costCenterModel: CostCenterModel
})

costCenterRouter.post('/', (req, res) => costCenterController.create(req, res))
costCenterRouter.get('/', (req, res) => costCenterController.getAll(req, res))
costCenterRouter.get('/:id', (req, res) =>
  costCenterController.getById(req, res)
)
costCenterRouter.delete('/:id', (req, res) =>
  costCenterController.deleteById(req, res)
)
costCenterRouter.patch('/:id', (req, res) =>
  costCenterController.updateById(req, res)
)
