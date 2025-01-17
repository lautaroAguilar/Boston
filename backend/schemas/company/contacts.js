import { z } from 'zod'

const contactSchema = z.object({
  name: z
    .string({
      required_error: 'El nombre del contacto es requerido',
    })
    .min(1, 'El nombre del contacto no puede estar vacío'),
  email: z
    .string({
      required_error: 'El email del contacto es requerido',
    })
    .min(1)
    .email('El email del contacto debe ser válido'),
  notes: z
    .string()
    .optional()
    .refine((val) => val === undefined || val.length > 0, {
      message: 'Las notas deben ser un texto válido si se proporcionan',
    }),
})
export function validateContact(contact) {
  return contactSchema.safeParse(contact)
}
export function validatePartialContact(contact) {
  return contactSchema.partial().safeParse(contact)
}