import { z } from 'zod'

const sectorSchema = z.object({
  name: z
    .string({
      required_error: 'El nombre del sector es requerido',
    })
    .min(1, 'El nombre del sector no puede estar vacío'),
})

const costCenterSchema = z.object({
  name: z
    .string({
      required_error: 'El nombre del centro de costo es requerido',
    })
    .min(1, 'El nombre del centro de costo no puede estar vacío'),
})

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
    .email('El email del contacto debe ser válido'),
  notes: z
    .string()
    .optional()
    .refine((val) => val === undefined || val.length > 0, {
      message: 'Las notas deben ser un texto válido si se proporcionan',
    }),
})

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
  sectors: z
    .array(sectorSchema)
    .min(1, 'Debe proporcionar al menos un sector')
    .optional(),
  costCenters: z
    .array(costCenterSchema)
    .min(1, 'Debe proporcionar al menos un centro de costo')
    .optional(),
  contacts: z
    .array(contactSchema)
    .min(1, 'Debe proporcionar al menos un contacto')
    .optional(),
})

export function validateCompany(company) {
  return companySchema.safeParse(company)
}
export function validatePartialCompany(company) {
  return companySchema.partial().safeParse(company)
}
