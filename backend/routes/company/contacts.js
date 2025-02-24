import { Router } from 'express'
import { ContactController } from '../../controllers/company/contacts.js'
import { ContactsModel } from '../../models/company/contacts.js'
import { authenticateToken } from '../../middlewares/auth.js'
export const contactRouter = Router({ mergeParams: true })

const contactController = new ContactController({ contactModel: ContactsModel })

contactRouter.post('/', authenticateToken, (req, res) =>
  contactController.create(req, res)
)
contactRouter.get('/', authenticateToken, (req, res) =>
  contactController.getAll(req, res)
)
contactRouter.get('/:contactId', authenticateToken, (req, res) =>
  contactController.getById(req, res)
)
contactRouter.delete('/:contactId', authenticateToken, (req, res) =>
  contactController.deleteById(req, res)
)
contactRouter.patch('/:contactId', authenticateToken, (req, res) =>
  contactController.updateById(req, res)
)
