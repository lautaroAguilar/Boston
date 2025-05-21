const { z } = require('zod')

const studentsSchema = z.object({
  first_name: z
    .string({ required_error: 'El nombre es requerido' })
    .trim()
    .min(3, 'Debe tener al menos 3 letras'),
  last_name: z
    .string({ required_error: 'El apellido es requerido' })
    .trim()
    .min(3, 'Debe tener al menos 3 letras'),
  email: z
    .string({ required_error: 'El email es requerido' })
    .trim()
    .email('El email debe ser válido'),
  sid: z.union([z.string().min(1), z.literal(''), z.null()]).optional(),
  initial_leveling_date: z
    .string({
      required_error: 'La fecha de nivelación inicial es requerida'
    })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'La fecha debe ser válida'
    })
    .transform((val) => new Date(val)),
  company_id: z
    .number({ required_error: 'El ID de la empresa es requerido' })
    .int('El ID de la empresa debe ser un número entero'),
  cost_center_id: z
    .number({ required_error: 'El ID del centro de costo es requerido' })
    .int('El ID del centro de costo debe ser un número entero'),
  sector_id: z
    .number({ required_error: 'El ID del sector es requerido' })
    .int('El ID del sector debe ser un número entero'),
  active: z.union([
    z.boolean(),
    z.number().transform(val => Boolean(val))
  ]).default(true).optional(),
  languages: z.array(
    z.object({
      language_id: z.number().int('El ID del idioma debe ser un número entero'),
      module_id: z.number().int('El ID del módulo debe ser un número entero')
    })
  ).min(1, 'Debe seleccionar al menos un idioma')
})

function validateStudents(student) {
  return studentsSchema.safeParse(student)
}

function validatePartialStudents(student) {
  return studentsSchema.partial().safeParse(student)
}

module.exports = { validateStudents, validatePartialStudents }
