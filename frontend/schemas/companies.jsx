import { z } from "zod";

export const companySchema = z.object({
  name: z
    .string({
      required_error: "El nombre de la empresa es requerido",
      invalid_type_error: "No puedes enviar este campo vacío",
    })
    .min(1),
  cuit: z.coerce
    .number({
      required_error: "El CUIT es requerido",
      invalid_type_error: "El CUIT debe ser un número",
    })
    .min(1, "Debe ser mayor a 0"),

  business_name: z
    .string({
      required_error: "La razón social es requerida",
      invalid_type_error: "No puedes enviar este campo vacío",
    })
    .min(1),
  sid: z.union([z.string().min(1), z.literal(""), z.null()]).optional(),
  survey_link: z
    .union([
      z
        .string()
        .url({ message: "El enlace de la encuesta debe ser una URL válida" }),
      z.literal(""),
      z.null(),
    ])
    .optional(),
});
export const contactSchema = z.object({
  name: z
    .string({
      required_error: "El nombre del contacto es requerido",
    })
    .min(1, "El nombre del contacto no puede estar vacío"),
  email: z
    .string({
      required_error: "El email del contacto es requerido",
    })
    .min(1)
    .email("El email del contacto debe ser válido"),
  notes: z
    .string()
    .optional()
    .refine((val) => val === undefined || val.length > 0, {
      message: "Las notas deben ser un texto válido si se proporcionan",
    }),
});
export const costCenterSchema = z.object({
  name: z
    .string({
      required_error: "El nombre del centro de costo es requerido",
    })
    .min(1, "El nombre del centro de costo no puede estar vacío"),
});
export const sectorSchema = z.object({
  name: z
    .string({
      required_error: "El nombre del sector es requerido",
    })
    .min(1, "El nombre del sector no puede estar vacío"),
});
