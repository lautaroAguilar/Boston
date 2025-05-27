const { z } = require('zod')

const passwordChangeSchema = z.object({
  currentPassword: z
    .string({ required_error: 'La contraseña actual es requerida' })
    .min(1, 'La contraseña actual es requerida'),
  newPassword: z
    .string({ required_error: 'La nueva contraseña es requerida' })
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    ),
})

function validatePasswordChange(data) {
  return passwordChangeSchema.safeParse(data)
}

module.exports = { validatePasswordChange } 