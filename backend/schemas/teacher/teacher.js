const { z } = require('zod')

const teacherSchema = z.object({
  firstName: z
    .string({ required_error: 'El nombre es requerido' })
    .trim()
    .min(3, 'Debe tener al menos 3 letras'),
  lastName: z
    .string({ required_error: 'El apellido es requerido' })
    .trim()
    .min(3, 'Debe tener al menos 3 letras'),
  email: z
    .string({ required_error: 'El email es requerido' })
    .trim()
    .email('El email debe ser válido'),
  phone: z
    .string()
    .trim()
    .min(10, 'El número de teléfono debe tener al menos 10 dígitos')
    .optional(),
  CBU: z
    .string()
    .trim()
    .min(22, 'El CBU debe tener 22 dígitos')
    .max(22, 'El CBU debe tener 22 dígitos')
    .optional(),
  CUIT: z
    .string()
    .trim()
    .min(11, 'El CUIT debe tener 11 dígitos')
    .max(11, 'El CUIT debe tener 11 dígitos')
    .optional(),
  professionalCategoryId: z.number({
    required_error: 'La categoría profesional es requerida',
    invalid_type_error: 'Elija una categoría profesional'
  }),
  fictitiousSeniority: z
    .string({ required_error: 'La antigüedad ficticia es requerida' })
    .min(10, 'La antigüedad ficticia debe ser una fecha válida'),
  bostonSeniority: z
    .string({ required_error: 'La antigüedad en Boston es requerida' })
    .min(10, 'La antigüedad en Boston debe ser una fecha válida'),
  observations: z.string().trim().optional(),
  languages: z
    .array(z.number().int())
    .min(1, 'Debe seleccionar al menos un idioma')
    .optional(),
  is_temp_password: z.boolean().default(false).optional()
})

function validateTeacher(teacher) {
  return teacherSchema.safeParse(teacher)
}

module.exports = {
  validateTeacher
}
