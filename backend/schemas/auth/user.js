const { z } = require('zod')

const userSchema = z.object({
  first_name: z
    .string({ required_error: 'El nombre es requerido' })
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres'),
  last_name: z
    .string({ required_error: 'El apellido es requerido' })
    .trim()
    .min(3, 'El apellido debe tener al menos 3 caracteres'),
  email: z
    .string({ required_error: 'El email es requerido' })
    .trim()
    .min(1, 'El email es requerido')
    .email('El email debe ser válido'),
  password: z
    .string()
    .trim()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .optional(),
  role_id: z
    .number({ invalid_type_error: 'Por favor, selecciona un rol.' })
    .int(),
  belongs_to: z.string().optional(),
  active: z
    .union([z.boolean(), z.number().transform((val) => Boolean(val))])
    .default(true)
    .optional(),
  is_temp_password: z.boolean().default(false).optional()
})

function validateRegister(user) {
  return userSchema.safeParse(user)
}

function validatePartialRegister(user) {
  return userSchema.partial().safeParse(user)
}

function validateLogin(user) {
  const loginSchema = z.object({
    email: z
      .string({ required_error: 'El email es requerido' })
      .trim()
      .min(1, 'El email es requerido')
      .email('El email debe ser válido'),
    password: z
      .string({ required_error: 'La contraseña es requerida' })
      .trim()
      .min(1, 'La contraseña es requerida')
  });
  return loginSchema.safeParse(user)
}

module.exports = { validateRegister, validatePartialRegister, validateLogin }
