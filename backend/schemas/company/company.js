import { z } from 'zod'

const companySchema = z.object({
  name: z
    .string({
      required_error: 'El nombre de la empresa es requerido',
    })
    .min(1),
  cuit: z
    .number({
      required_error: 'El CUIT es requerido',
      invalid_type_error: 'el CUIT debe ser un número',
    })
    .min(1),
  business_name: z
    .string({
      required_error: 'La razón social es requerida',
    })
    .min(1),
  sid: z
    .string()
    .optional()
    .refine((val) => val === undefined || val.length > 0, {
      message: 'El SID debe ser un texto válido si se proporciona',
    }),
  survey_link: z
    .string()
    .url({ message: 'El enlace de la encuesta debe ser una URL válida' })
    .optional(),
})

export function validateCompany(company) {
  return companySchema.safeParse(company)
}
export function validatePartialCompany(company) {
  return companySchema.partial().safeParse(company)
}
