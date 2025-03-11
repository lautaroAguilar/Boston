const { z } = require('zod')

const contactSchema = z.object({
  name: z.string().min(1, 'El nombre no puede estar vacío'),
  email: z
    .string()
    .min(1, 'El email no puede estar vacío')
    .email('El email del contacto debe ser válido'),
  notes: z.string().optional()
})

function validateContact(contact) {
  return contactSchema.safeParse(contact)
}

function validatePartialContact(contact) {
  return contactSchema.partial().safeParse(contact)
}

module.exports = { contactSchema, validateContact, validatePartialContact }
