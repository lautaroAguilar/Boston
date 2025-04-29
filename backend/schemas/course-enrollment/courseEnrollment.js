const { z } = require('zod')

// Esquema completo para crear una inscripción
const courseEnrollmentSchema = z.object({
  studentId: z.number().int().positive().or(z.string().regex(/^\d+$/).transform(Number)),
  groupId: z.number().int().positive().or(z.string().regex(/^\d+$/).transform(Number)),
  languageId: z.number().int().positive().or(z.string().regex(/^\d+$/).transform(Number)),
  moduleId: z.number().int().positive().or(z.string().regex(/^\d+$/).transform(Number)),
  attendance: z.number().min(0).max(100).default(0),
  averageScore: z.number().min(0).max(10).default(0),
  status: z.enum(['activo', 'completado', 'abandonado']).default('activo'),
  startDate: z.coerce.date().default(() => new Date()),
  endDate: z.coerce.date().optional().nullable(),
  observations: z.string().max(1000).optional().nullable(),
})

// Esquema parcial para actualizaciones
const partialCourseEnrollmentSchema = courseEnrollmentSchema.partial()

// Esquema para completar un curso
const completeCourseSchema = z.object({
  endDate: z.coerce.date().default(() => new Date()),
  observations: z.string().max(1000).optional(),
})

// Validación de la inscripción completa
function validateCourseEnrollment(data) {
  return courseEnrollmentSchema.safeParse(data)
}

// Validación parcial para actualizaciones
function validatePartialCourseEnrollment(data) {
  return partialCourseEnrollmentSchema.safeParse(data)
}

// Validación para completar un curso
function validateCompleteCourse(data) {
  return completeCourseSchema.safeParse(data)
}

module.exports = {
  validateCourseEnrollment,
  validatePartialCourseEnrollment,
  validateCompleteCourse
} 