const express = require('express')
require('dotenv/config')
const cookieParser = require('cookie-parser')
const { corsMiddleware } = require('./middlewares/cors.js')
const { companiesRouter } = require('./routes/company/company.js')
const { userAuthRouter } = require('./routes/auth/user.js')
const { userRouter } = require('./routes/users/users.js')
const { studentsRouter } = require('./routes/students/students.js')
const { settingsRouter } = require('./routes/settings/settings.js')
const app = express()
const PORT = process.env.PORT ?? 3000
app.use(express.json())
app.use(corsMiddleware())
app.use(cookieParser())
app.disable('x-powered-by')
app.options('/api/*', corsMiddleware())

app.use('/api/companies', companiesRouter)
app.use('/api/user', userRouter)
app.use('/api/auth', userAuthRouter)
app.use('/api/students', studentsRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/test', (req, res) => {
  res.status(200).send('Endpoint de pruebas funcionando correctamente')
})
/* 
  app.use('/api/course', Router)
  app.use('/api/education', Router) */

// Solo inicia el servidor si este archivo se ejecuta directamente
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`)
  })
}
module.exports = app
