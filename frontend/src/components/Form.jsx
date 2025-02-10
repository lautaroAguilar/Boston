import React, { useState } from "react";
import {
  Box,
  Stack,
  TextField,
  InputLabel,
  Select,
  MenuItem,
  Button,
  FormControl,
  FormHelperText,
  Typography,
  Stepper,
  Step,
  StepLabel,
  useMediaQuery,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function MyForm({
  fields,
  values = {},
  onChange,
  onSubmit, // ⬅️ Se usa si no hay steps
  handleSubmitPerStep = {}, // ⬅️ Se usa si hay steps
  buttonText,
  errors = {},
  successMessage,
  errorMessage,
  steps = [], // ⬅️ Si hay pasos, se usa el Stepper
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set()); // Estado para steps completados
  const isMobile = useMediaQuery("(max-width:600px)");
  // Determinar si se usa Steps o no
  const isStepperActive = steps.length > 0;

  const handleNext = async () => {
    if (isStepperActive) {
      const currentStepKey = steps[activeStep];
      const handleStep = handleSubmitPerStep[currentStepKey];

      if (handleStep) {
        if (!completedSteps.has(currentStepKey)) {
          // Se verifica si el paso fue completado
          const success = await handleStep();
          if (success) {
            // Marcar el paso como completado
            setCompletedSteps((prev) => new Set(prev).add(currentStepKey));
            // Solo avanza si es exitoso
            setActiveStep((prev) => prev + 1);
          } else {
            console.log("no fue satisfactorio");
          }
        } else {
          // Si ya estaba completado el paso, avanza solamente
          setActiveStep((prev) => prev + 1);
        }
      } else {
        // Avanza si no hay función de manejo
        setActiveStep((prev) => prev + 1);
      }
    }
  };

  const handleBack = () => {
    if (isStepperActive) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isStepperActive) {
      if (activeStep < steps.length - 1) {
        handleNext();
      } else {
        const finalStep = handleSubmitPerStep[steps[activeStep]];
        if (finalStep) await finalStep();
      }
    } else {
      // ⬅️ Si no hay steps, ejecuta el onSubmit normal
      await onSubmit();
    }
  };

  // Filtrar los campos según el paso actual (si hay steps)
  const currentFields = isStepperActive ? fields[activeStep] : fields;

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        height: "100%",
        width: "100%",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Renderizar los campos del step actual o todos si no hay steps */}
      <Stack spacing={2} sx={{ mt: 2 }}>
        {currentFields.map((field, index) => (
          <Stack key={index}>
            {(() => {
              switch (field.component) {
                case "select":
                  return (
                    <FormControl fullWidth>
                      <InputLabel>{field.label}</InputLabel>
                      <Select
                        name={field.name}
                        label={field.label}
                        value={values[field.name] || ""}
                        onChange={(e) => onChange(field.name, e.target.value)}
                        required={field.required ?? false}
                      >
                        {field.options?.map((opt) => (
                          <MenuItem key={opt.id} value={opt.label}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors && errors[field.name] && (
                        <FormHelperText>{errors[field.name]}</FormHelperText>
                      )}
                    </FormControl>
                  );
                case "date":
                  return (
                    <DatePicker
                      label={field.label}
                      value={values[field.name] ?? null}
                      onChange={(newValue) =>
                        onChange(
                          field.name,
                          newValue ? newValue.toString() : ""
                        )
                      }
                      slotProps={{
                        textField: {
                          error: Boolean(errors[field.name]),
                          helperText: errors[field.name] ?? "",
                        },
                      }}
                    />
                  );
                default:
                  return (
                    <TextField
                      fullWidth
                      type={showPassword ? "text" : (field.type ?? "text")}
                      label={field.label}
                      name={field.name}
                      required={field.required ?? false}
                      value={values[field.name] ?? ""}
                      onChange={(e) => onChange(field.name, e.target.value)}
                      error={Boolean(errors[field.name])}
                      helperText={errors[field.name] ?? ""}
                      slotProps={{
                        input: {
                          endAdornment: field.type === "password" && (
                            <Button
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </Button>
                          ),
                        },
                      }}
                    />
                  );
              }
            })()}
          </Stack>
        ))}
        <Typography>{successMessage}</Typography>
        <Typography>{errorMessage}</Typography>
      </Stack>
      {/* Stepper solo si hay pasos */}
      {isStepperActive && (
        <Stepper activeStep={activeStep} sx={{ width: "100%" }}>
          {steps.map((label, index) => (
            <Step key={index}>
              <StepLabel>{!isMobile ? label : ""}</StepLabel>
            </Step>
          ))}
        </Stepper>
      )}

      {/* Botones de navegación */}
      <Stack
        sx={{
          mt: 2,
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
        }}
        spacing={2}
        direction="row"
      >
        {isStepperActive && activeStep > 0 && (
          <Button variant="outlined" onClick={handleBack}>
            Anterior
          </Button>
        )}
        <Button type="submit" variant="contained">
          {isStepperActive && activeStep === steps.length - 1
            ? buttonText
            : isStepperActive
              ? "Siguiente"
              : buttonText}
        </Button>
      </Stack>
    </Box>
  );
}
