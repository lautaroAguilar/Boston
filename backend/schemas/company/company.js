import { z } from 'zod'

const companySchema = z.object({
  name: z
    .string({
      required_error: 'El nombre de la empresa es requerido',
      invalid_type_error: 'No puedes enviar este campo vacío'
    })
    .min(1),
  cuit: z.coerce
    .number({
      required_error: 'El CUIT es requerido',
      invalid_type_error: 'El CUIT debe ser un número'
    })
    .min(1, 'Debe ser mayor a 0'),

  business_name: z
    .string({
      required_error: 'La razón social es requerida',
      invalid_type_error: 'No puedes enviar este campo vacío'
    })
    .min(1),
  sid: z.union([z.string().min(1), z.literal(''), z.null()]).optional(),
  survey_link: z
    .union([
      z
        .string()
        .url({ message: 'El enlace de la encuesta debe ser una URL válida' }),
      z.literal(''),
      z.null()
    ])
    .optional()
})

export function validateCompany(company) {
  return companySchema.safeParse(company)
}
export function validatePartialCompany(company) {
  return companySchema.partial().safeParse(company)
}
