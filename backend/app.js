import express, { json } from 'express'
import { createCompanyRouter } from './routes/company.js'
import corsMiddleware from './middlewares/cors.js'
import 'dotenv/config'

export const createApp = ({ companyModel }) => {
  const app = express()
  const PORT = process.env.PORT ?? 3000
  app.use(json())
  app.use(corsMiddleware())
  app.disable('x-powered-by')
  
  app.use('/company', createCompanyRouter({ companyModel }))
  
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`)
  })
}
