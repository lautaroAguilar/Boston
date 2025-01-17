import { z } from 'zod'

const costCenterSchema = z.object({
  name: z
    .string({
      required_error: 'El nombre del centro de costo es requerido',
    })
    .min(1, 'El nombre del centro de costo no puede estar vacío'),
})
export function validateCostCenter(costCenter) {
  return costCenterSchema.safeParse(costCenter)
}
export function validatePartialCostCenter(costCenter) {
  return costCenterSchema.partial().safeParse(costCenter)
}
