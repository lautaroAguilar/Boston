const { z } = require('zod')

const companySchema = z.object({
  name: z
    .string({
      invalid_type_error: 'No puedes enviar este campo vacío'
    })
    .min(1, 'El nombre de la empresa es requerido'),
  cuit: z.coerce
    .number({
      invalid_type_error: 'El CUIT debe ser un número'
    })
    .min(1, 'El CUIT es requerido'),

  business_name: z
    .string({
      invalid_type_error: 'No puedes enviar este campo vacío'
    })
    .min(1, 'La razón social es requerida'),
  first_survey_link: z
    .union([
      z
        .string()
        .url({ message: 'El enlace de la encuesta debe ser una URL válida' }),
      z.literal(''),
      z.null()
    ])
    .optional(),
  second_survey_link: z
    .union([
      z
        .string()
        .url({ message: 'El enlace de la encuesta debe ser una URL válida' }),
      z.literal(''),
      z.null()
    ])
    .optional(),
  active: z.boolean().default(true).optional()
})

function validateCompany(company) {
  return companySchema.safeParse(company)
}
function validatePartialCompany(company) {
  return companySchema.partial().safeParse(company)
}

module.exports = { validateCompany, validatePartialCompany }
