const { z } = require('zod')

const costCenterSchema = z.object({
  name: z
    .string({
      required_error: 'El nombre del centro de costo es requerido'
    })
    .min(1, 'El nombre del centro de costo no puede estar vacío')
})

function validateCostCenter(costCenter) {
  return costCenterSchema.safeParse(costCenter)
}

function validatePartialCostCenter(costCenter) {
  return costCenterSchema.partial().safeParse(costCenter)
}

module.exports = { costCenterSchema, validateCostCenter, validatePartialCostCenter }
