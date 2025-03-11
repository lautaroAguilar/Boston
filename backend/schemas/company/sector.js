const { z } = require('zod')

const sectorSchema = z.object({
  name: z
    .string({
      required_error: 'El nombre del sector es requerido'
    })
    .min(1, 'El nombre del sector no puede estar vacío')
})

function validateSector(sector) {
  return sectorSchema.safeParse(sector)
}

function validatePartialSector(sector) {
  return sectorSchema.partial().safeParse(sector)
}

module.exports = { sectorSchema, validateSector, validatePartialSector }
