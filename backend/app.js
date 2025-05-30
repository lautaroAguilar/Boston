const express = require('express')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const { corsMiddleware } = require('./middlewares/cors.js')
const { companiesRouter } = require('./routes/company/company.js')
const { userAuthRouter } = require('./routes/auth/user.js')
const { passwordRouter } = require('./routes/auth/password.js')
const { userRouter } = require('./routes/users/users.js')
const { studentsRouter } = require('./routes/students/students.js')
const { settingsRouter } = require('./routes/settings/settings.js')
const { teacherRouter } = require('./routes/teacher/teacher.js')
const { groupRouter } = require('./routes/group/group.js')
const { scheduleRouter } = require('./routes/schedule/schedule.js')
dotenv.config()
const app = express()
const PORT = process.env.PORT || 3000
app.use(express.json())
app.use(corsMiddleware())
app.use(cookieParser())
app.disable('x-powered-by')

app.get('/', (req, res) => {
  res.redirect('/api/test')
})
app.get('/api/test', (req, res) => {
  res.send('Endpoint de pruebas funcionando correctamente')
})
app.use('/api/companies', companiesRouter)
app.use('/api/user', userRouter)
app.use('/api/auth', userAuthRouter)
app.use('/api/password', passwordRouter)
app.use('/api/students', studentsRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/teachers', teacherRouter)
app.use('/api/groups', groupRouter)
app.use('/api/schedules', scheduleRouter)
/* 
  app.use('/api/course', Router)
  app.use('/api/education', Router) */

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`)
})

module.exports = app
