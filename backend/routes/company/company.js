const { Router } = require('express')
const { CompanyController } = require('../../controllers/company/company.js')
const { CompanyModel } = require('../../models/company/company.js')

const { sectorRouter } = require('./sector.js')
const { contactRouter } = require('./contacts.js')
const { costCenterRouter } = require('./cost_center.js')
const { authenticateToken } = require('../../middlewares/auth.js')
const companiesRouter = Router()

const companyController = new CompanyController({ companyModel: CompanyModel })

companiesRouter.get('/', authenticateToken, companyController.getAll)
companiesRouter.post('/', authenticateToken, companyController.create)
companiesRouter.post('/fullCompany', authenticateToken, companyController.createFullCompany) 
companiesRouter.get('/:companyId', authenticateToken, companyController.getById)
companiesRouter.delete(
  '/:companyId',
  authenticateToken,
  companyController.deleteById
)
companiesRouter.patch(
  '/:companyId',
  authenticateToken,
  companyController.updateById
)

companiesRouter.use('/:companyId/contacts', contactRouter)
companiesRouter.use('/:companyId/sectors', sectorRouter)
companiesRouter.use('/:companyId/cost-centers', costCenterRouter)

module.exports = { companiesRouter }
