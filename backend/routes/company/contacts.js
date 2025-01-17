import { Router } from 'express'
import { ContactController } from '../../controllers/company/contacts.js'
import { ContactsModel } from '../../models/company/contacts.js'
export const contactRouter = Router({ mergeParams: true })

const contactController = new ContactController({ contactModel: ContactsModel })

contactRouter.post('/', (req, res) => contactController.create(req, res))
contactRouter.get('/', (req, res) => contactController.getAll(req, res))
contactRouter.get('/:id', (req, res) => contactController.getById(req, res))
contactRouter.delete('/:id', (req, res) =>
  contactController.deleteById(req, res)
)
contactRouter.patch('/:id', (req, res) =>
  contactController.updateById(req, res)
)
