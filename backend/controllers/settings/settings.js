class SettingsController {
  constructor({ settingsModel }) {
    this.settingsModel = settingsModel
  }
  getAllModules = async (req, res) => {
    try {
      const modules = await this.settingsModel.getAllModules()
      if (!modules.length) {
        return res
          .status(200)
          .json({ data: [], message: 'No se encontraron lenguajes' })
      }
      res.status(200).json(modules)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
  getAllLanguages = async (req, res) => {
    try {
      const languages = await this.settingsModel.getAllLanguages()
      if (!languages.length) {
        return res
          .status(200)
          .json({ data: [], message: 'No se encontraron lenguajes' })
      }
      res.status(200).json(languages)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
  getAllRoles = async (req, res) => {
    try {
      const roles = await this.settingsModel.getAllRoles()
      if (!roles.length) {
        return res
          .status(200)
          .json({ data: [], message: 'No se encontraron roles' })
      }
      res.status(200).json(roles)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
}
module.exports = { SettingsController }
