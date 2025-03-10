import express, { json } from 'express'
import 'dotenv/config'
import cookieParser from 'cookie-parser'
import corsMiddleware from './middlewares/cors.js'
import { companiesRouter } from './routes/company/company.js'
import { userAuthRouter } from './routes/auth/user.js'
import { userRouter } from './routes/users/users.js'
import { studentsRouter } from './routes/students/students.js'
import { settingsRouter } from './routes/settings/settings.js'
const app = express()
const PORT = process.env.PORT ?? 3000
app.use(json())
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
  res.status(200).send('Endpoint de pruebas funcionando correctamente');
})
/* 
  
  app.use('/api/course', Router)
  app.use('/api/education', Router) */
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`)
})
