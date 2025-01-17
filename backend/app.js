import express, { json } from 'express'
import corsMiddleware from './middlewares/cors.js'
import 'dotenv/config'
import { companiesRouter } from './routes/company/company.js'

const app = express()
const PORT = process.env.PORT ?? 3000
app.use(json())
app.use(corsMiddleware())
app.disable('x-powered-by')

app.use('/api/companies', companiesRouter)
/* app.use('/api/user', Router)
  app.use('/api/auth', Router)
  app.use('/api/course', Router)
  app.use('/api/education', Router) */
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`)
})
