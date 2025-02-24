import { Router } from 'express'
import { CostCenterController } from '../../controllers/company/cost_center.js'
import { CostCenterModel } from '../../models/company/cost_center.js'
import { authenticateToken } from '../../middlewares/auth.js'
export const costCenterRouter = Router({ mergeParams: true })

const costCenterController = new CostCenterController({
  costCenterModel: CostCenterModel
})

costCenterRouter.post('/', authenticateToken, (req, res) =>
  costCenterController.create(req, res)
)
costCenterRouter.get('/', authenticateToken, (req, res) =>
  costCenterController.getAll(req, res)
)
costCenterRouter.get('/:costCenterId', authenticateToken, (req, res) =>
  costCenterController.getById(req, res)
)
costCenterRouter.delete('/:costCenterId', authenticateToken, (req, res) =>
  costCenterController.deleteById(req, res)
)
costCenterRouter.patch('/:costCenterId', authenticateToken, (req, res) =>
  costCenterController.updateById(req, res)
)
