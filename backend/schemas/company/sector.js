import { z } from 'zod'
const sectorSchema = z.object({
  name: z
    .string({
      required_error: 'El nombre del sector es requerido',
    })
    .min(1, 'El nombre del sector no puede estar vacío'),
})
export function validateSector(sector) {
  return sectorSchema.safeParse(sector)
}
export function validatePartialSector(sector) {
  return sectorSchema.partial().safeParse(sector)
}
