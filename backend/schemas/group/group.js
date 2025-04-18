const { z } = require('zod')

const groupSchema = z.object({
  name: z
    .string({ required_error: 'El nombre es requerido' })
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres'),
  teacherId: z
    .number({ required_error: 'El profesor es requerido' })
    .int('El ID del profesor debe ser un número entero'),
  languageId: z
    .number({ required_error: 'El idioma es requerido' })
    .int('El ID del idioma debe ser un número entero'),
  moduleId: z
    .number({ required_error: 'El módulo es requerido' })
    .int('El ID del módulo debe ser un número entero'),
  modalityId: z
    .number({ required_error: 'La modalidad es requerida' })
    .int('El ID de la modalidad debe ser un número entero'),
  statusId: z
    .number()
    .int('El ID del estado debe ser un número entero')
    .optional(),
  students: z
    .array(z.number().int('Los IDs de estudiantes deben ser números enteros'))
    .optional(),
  companyId: z
    .number({ required_error: 'La empresa es requerida' })
    .int('El ID de la empresa debe ser un número entero')
})

function validateGroup(group) {
  return groupSchema.safeParse(group)
}

function validatePartialGroup(group) {
  return groupSchema.partial().safeParse(group)
}

module.exports = {
  validateGroup,
  validatePartialGroup
}
