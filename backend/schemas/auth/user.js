import { z } from 'zod'

const userSchema = z.object({
  name: z
    .string({ required_error: 'El nombre es requerido' })
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z
    .string({ required_error: 'El email es requerido' })
    .trim()
    .min(1, 'El email es requerido')
    .email('El email debe ser válido'),
  password: z
    .string({ required_error: 'La contraseña es requerida' })
    .trim()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role: z.enum(['Administrador', 'Coordinador', 'Recursos Humanos'], {
    required_error: 'El rol es requerido',
    message: 'El rol debe ser Administrador, Coordinador o RRHH'
  })
})

export function validateRegister(user) {
  return userSchema.safeParse(user)
}

export function validatePartialRegister(user) {
  return userSchema.partial().safeParse(user)
}

export function validateLogin(user) {
  const loginSchema = userSchema.pick({ email: true, password: true })
  return loginSchema.safeParse(user)
}
