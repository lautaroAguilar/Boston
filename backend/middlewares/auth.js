import jwt from 'jsonwebtoken'
export function authenticateToken(req, res, next) {
  try {
    const token = req.cookies.accessToken
    if (!token) {
      return res.status(401).json({ message: 'No estás autenticado' })
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Token inválido o expirado' })
      }
      req.user = decoded
      next()
    })
  } catch (error) {
    return res.status(401).json({ message: 'No estás autenticado' })
  }
}
