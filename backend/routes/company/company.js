import { Router } from 'express'
import { CompanyController } from '../../controllers/company/company.js'
import { CompanyModel } from '../../models/company/company.js'

import { sectorRouter } from './sector.js'
import { contactRouter } from './contacts.js'
import { costCenterRouter } from './cost_center.js'
import { authenticateToken } from '../../middlewares/auth.js'
export const companiesRouter = Router()

const companyController = new CompanyController({ companyModel: CompanyModel })

companiesRouter.get('/', authenticateToken, companyController.getAll)
companiesRouter.post('/', authenticateToken, companyController.create)
companiesRouter.get('/:id', authenticateToken, companyController.getById)
companiesRouter.delete('/:id', authenticateToken, companyController.deleteById)
companiesRouter.patch('/:id', authenticateToken, companyController.updateById)

companiesRouter.use('/:id/contacts', contactRouter)
companiesRouter.use('/:id/sectors', sectorRouter)
companiesRouter.use('/:id/cost-centers', costCenterRouter)
