"use client";
import React, { useState } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Box,
  Stack,
  Typography,
} from "@mui/material";
import MyForm from "./Form";
import { useCompany } from "@/contexts/companies";
/**
 * FormStepper con validación opcional en cada paso.
 *
 * @param {Array} steps - Cada elemento es un objeto con:
 *   {
 *     label: string,
 *     description?: string,
 *     schema?: ZodSchema,        // (opcional) Schema Zod para validar este paso
 *     values?: object,           // estado con los valores del form en este paso
 *     setValues?: function,      // setter para actualizar los valores
 *     fields?: array,            // campos a renderizar en <MyForm>, si lo usas
 *     content?: ReactNode        // contenido personalizado (si no usas <MyForm>)
 *   }
 * @param {Function} onFinish - Se llama al hacer click en "Finalizar" (último step)
 */
export default function FormStepper({ steps, onFinish }) {
  const { errorMessage } = useCompany();
  const [activeStep, setActiveStep] = useState(0);
  const [formErrors, setFormErrors] = useState({});

  const handleNext = () => {
    setFormErrors({});
    const currentStep = steps[activeStep];

    /* Si el paso actual tiene un schema de validación, lo usamos */
    if (currentStep?.schema && currentStep?.values) {
      const parseResult = currentStep.schema.safeParse(currentStep.values);
      if (!parseResult.success) {
        /* Armamos un objeto de errores y para pasarle al componente MyForm */
        const errorObj = {};
        parseResult.error.issues.forEach((issue) => {
          const fieldName = issue.path[0];
          errorObj[fieldName] = issue.message;
        });
        setFormErrors(errorObj);
        return; /* No avanzamos si falla la validación */
      }
    }

    /* Si pasa la validación o no hay schema, limpiamos errores y avanzamos */
    setFormErrors({});

    if (activeStep < steps.length - 1) {
      /* Todavía no es el último paso */
      setActiveStep((prev) => prev + 1);
    } else {
      /* Si es el último paso, llamamos a onFinish */
      onFinish && onFinish();
    }
  };

  const handleBack = () => {
    setFormErrors({});
    setActiveStep((prev) => prev - 1);
  };

  return (
    <Stepper activeStep={activeStep} orientation="vertical">
      {steps.map((step, index) => (
        <Step key={index}>
          <StepLabel>{step.label}</StepLabel>
          <StepContent>
            <Stack spacing={2}>
              {/* DESCRIPCIÓN */}
              {step.description && <Typography>{step.description}</Typography>}

              {step.fields && step.values && step.setValues && (
                <MyForm
                  fields={step.fields}
                  values={step.values}
                  onChange={(fieldName, newValue) => {
                    step.setValues((prev) => ({
                      ...prev,
                      [fieldName]: newValue,
                    }));
                  }}
                  errors={formErrors}
                  errorMessage={errorMessage}
                />
              )}

              {/* PODEMOS PASAR UNA PROPIEDAD CONTENT DESDE EL ARRAY STEP */}
              {step.content && step.content}
              
              <Box>
                {index < steps.length - 1 ? (
                  <Button variant="contained" onClick={handleNext}>
                    Siguiente
                  </Button>
                ) : (
                  <Button variant="contained" onClick={handleNext}>
                    Finalizar
                  </Button>
                )}

                {index > 0 && (
                  <Button sx={{ ml: 2 }} onClick={handleBack}>
                    Atrás
                  </Button>
                )}
              </Box>
            </Stack>
          </StepContent>
        </Step>
      ))}
    </Stepper>
  );
}
