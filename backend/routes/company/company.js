import { Router } from 'express'
import { CompanyController } from '../../controllers/company/company.js'
import { CompanyModel } from '../../models/company/company.js'
import { sectorRouter } from './sector.js'
import { contactRouter } from './contacts.js'
import { costCenterRouter } from './cost_center.js'

export const companiesRouter = Router()

const companyController = new CompanyController({ companyModel: CompanyModel })

companiesRouter.get('/', companyController.getAll)
companiesRouter.post('/', companyController.create)
companiesRouter.get('/:id', companyController.getById)
companiesRouter.delete('/:id', companyController.deleteById)
companiesRouter.patch('/:id', companyController.updateById)

companiesRouter.use('/:id/contacts', contactRouter)
companiesRouter.use('/:id/sectors', sectorRouter)
companiesRouter.use('/:id/cost-centers', costCenterRouter)
