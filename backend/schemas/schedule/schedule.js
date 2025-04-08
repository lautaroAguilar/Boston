const { z } = require('zod')

const daySchema = z.object({
  dayOfWeek: z.number().min(0).max(6), // 0 = Domingo, 6 = Sábado
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), // Formato HH:MM
  duration: z.number().min(30).max(240), // Duración en minutos
})

const scheduleSchema = z.object({
  days: z.array(daySchema).min(1, 'Debe haber al menos un día en el cronograma')
})

function validateSchedule(schedule) {
  return scheduleSchema.safeParse(schedule)
}

function validatePartialSchedule(schedule) {
  return scheduleSchema.partial().safeParse(schedule)
}

module.exports = {
  validateSchedule,
  validatePartialSchedule
} 