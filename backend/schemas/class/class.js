// backend/schemas/class/class.js
const { z } = require('zod');

// Schema para crear una clase
const classSchema = z.object({
  date: z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/, 'Formato de fecha inválido. Use YYYY-MM-DD'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido. Use HH:MM'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido. Use HH:MM'),
  teacherAttendance: z.boolean().optional(),
  activities: z.string().optional(),
  observations: z.string().optional(),
  content: z.string().optional()
});

// Schema para la asistencia de un estudiante
const attendanceSchema = z.object({
  studentId: z.number(),
  status: z.string(),
  timeAttendance: z.number().default(0).optional()
});

// Schema para actualizar una clase con asistencias
const classUpdateSchema = classSchema.partial().extend({
  attendances: z.array(attendanceSchema).optional()
});

function validateClass(classData) {
  return classSchema.safeParse(classData);
}

function validatePartialClass(classData) {
  return classUpdateSchema.safeParse(classData);
}

module.exports = {
  validateClass,
  validatePartialClass
};