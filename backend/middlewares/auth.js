import jwt from 'jsonwebtoken'
export function authenticateToken(req, res, next) {
  try {
    const token = req.cookies.access_token
    if (!token) {
      return res.status(401).json({ error: 'No estás autenticado' })
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expirado' })
        }
        return res.status(403).json({ error: 'Token inválido' })
      }
      req.user = decoded
      next()
    })
  } catch (error) {
    return res.status(401).json({ error: 'Error de autenticación' })
  }
}
