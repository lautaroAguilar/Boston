import { z } from "zod";

export const companySchema = z.object({
  name: z
    .string({
      invalid_type_error: "No puedes enviar este campo vacío",
    })
    .min(1, "El nombre de la empresa es requerido"),
  cuit: z.coerce
    .number({
      invalid_type_error: "El CUIT debe ser un número",
    })
    .min(1, "El CUIT es requerido"),

  business_name: z
    .string({
      invalid_type_error: "No puedes enviar este campo vacío",
    })
    .min(1, "La razón social es requerida"),
  sid: z.string().min(1, "El SID es requerido"),
  survey_link: z
    .string()
    .min(1, "Tenés que agregar el link para la encuesta")
    .url({ message: "El enlace de la encuesta debe ser una URL válida" }),
});
export const contactSchema = z.object({
  name: z.string().min(1, "El nombre no puede estar vacío"),
  email: z
    .string()
    .min(1, "El email no puede estar vacío")
    .email("El email del contacto debe ser válido"),
  notes: z.string().optional(),
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
