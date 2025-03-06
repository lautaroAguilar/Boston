import { Router } from 'express'
import { SettingsController } from '../../controllers/settings/settings.js'
import { SettingsModel } from '../../models/settings/settings.js'

export const settingsRouter = Router()
const settingsController = new SettingsController({
  settingsModel: SettingsModel
})

settingsRouter.get('/modules', settingsController.getAllModules)
settingsRouter.get('/languages', settingsController.getAllLanguages)
settingsRouter.get('/roles', settingsController.getAllRoles)
