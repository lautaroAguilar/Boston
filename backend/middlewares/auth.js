export function authenticateToken(req, res, next) {
  const token = req.cookies.accesToken

  if (!token) {
    return res.status(401).json({ message: 'No autorizado' })
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET)
    req.user = user
    next()
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido o expirado' })
  }
}
