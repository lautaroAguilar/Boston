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
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function MyForm({
  fields,
  values = {},
  onChange,
  errors = {},
  successMessage,
  errorMessage,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Box
      component="form"
      sx={{
        height: "100%",
        width: "100%",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Stack spacing={2} sx={{ mt: 2 }}>
        {fields.map((field, index) => (
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
    </Box>
  );
}
