import { z } from "zod";
export const studentStepOneSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(3, "El nombre debe contener al menos 3 letras"),
  last_name: z
    .string()
    .trim()
    .min(3, "El apellido debe contener al menos 3 letras"),
  email: z.string().trim().email("El email debe ser válido"),
  sid: z.union([z.string().min(1), z.literal(""), z.null()]).optional(),
  cost_center_id: z
    .union([
      z.number().int("El ID del centro de costo debe ser un número entero"),
      z.literal(""),
    ])
    .refine((val) => val !== "", {
      message: "Se debe seleccionar una opción para asignar el centro de costo",
    }),
  sector_id: z
    .union([
      z.number().int("El ID del sector debe ser un número entero"),
      z.literal(""),
    ])
    .refine((val) => val !== "", {
      message: "Se debe seleccionar una opción para asignar el sector",
    }),
});

export const studentStepTwoSchema = z.object({
  initial_leveling_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "La fecha debe ser válida",
  }),
  language_id: z
    .union([
      z.number().int("El ID del idioma debe ser un número entero"),
      z.literal(""),
    ])
    .refine((val) => val !== "", {
      message: "Se debe seleccionar una opción para asignar el idioma",
    }),
  module_id: z
    .union([
      z.number().int("El ID del módulo debe ser un número entero"),
      z.literal(""),
    ])
    .refine((val) => val !== "", {
      message: "Se debe seleccionar una opción para asignar el módulo",
    }),
  level_id: z
    .union([
      z.number().int("El ID del nivel debe ser un número entero"),
      z.literal(""),
    ])
    .refine((val) => val !== "", {
      message: "Se debe seleccionar una opción para asignar el nivel",
    }),
});
