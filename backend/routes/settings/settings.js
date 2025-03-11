const { Router } = require('express')
const { SettingsController } = require('../../controllers/settings/settings.js')
const { SettingsModel } = require('../../models/settings/settings.js')

const settingsRouter = Router()
const settingsController = new SettingsController({
  settingsModel: SettingsModel
})

settingsRouter.get('/modules', settingsController.getAllModules)
settingsRouter.get('/languages', settingsController.getAllLanguages)
settingsRouter.get('/roles', settingsController.getAllRoles)

module.exports = { settingsRouter }
