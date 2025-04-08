const { z } = require('zod')

const classSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido. Use YYYY-MM-DD'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido. Use HH:MM'),
  duration: z.number().min(30).max(240) // duración en minutos
})

function validateClass(classData) {
  return classSchema.safeParse(classData)
}

module.exports = {
  validateClass
} 