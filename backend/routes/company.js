import { Router } from 'express'
import { CompanyController } from '../controllers/company.js'
export const createCompanyRouter = ({ companyModel }) => {
  const companyRouter = Router()

  const companyController = new CompanyController({ companyModel })

  companyRouter.get('/', companyController.getAll)
  companyRouter.post('/', companyController.create)
  companyRouter.get('/:id', companyController.getById)
  companyRouter.delete('/:id', companyController.deleteById)
  companyRouter.patch('/:id', companyController.updateById)

  return companyRouter
}
