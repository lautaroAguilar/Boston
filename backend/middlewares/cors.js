const cors = require('cors')
const ACCEPTED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:3306',
  'http://localhost:1234',
  'http://localhost:3000'
]

function corsMiddleware({ acceptedOrigins = ACCEPTED_ORIGINS } = {}) {
  return cors({
    origin: (origin, callback) => {
      if (acceptedOrigins.includes(origin) || !origin) {
        return callback(null, true)
      }
      return callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
}

module.exports = { corsMiddleware }
