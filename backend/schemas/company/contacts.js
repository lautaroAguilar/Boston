import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().min(1, 'El nombre no puede estar vacío'),
  email: z
    .string()
    .min(1, 'El email no puede estar vacío')
    .email('El email del contacto debe ser válido'),
  notes: z.string().optional()
})
export function validateContact(contact) {
  return contactSchema.safeParse(contact)
}
export function validatePartialContact(contact) {
  return contactSchema.partial().safeParse(contact)
}
