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
  Switch,
  FormControlLabel,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import LocalizationWrapper from "./LocalizationWrapper";
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
        height: "auto",
        width: "100%",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Stack spacing={2} sx={{ height: "100%", mt: 2 }}>
        {fields.map((field, index) => (
          <Stack key={field.name ?? index}>
            {(() => {
              switch (field.component) {
                case "select":
                  return (
                    <FormControl fullWidth>
                      <InputLabel>{field.label}</InputLabel>
                      <Select
                        name={field.name}
                        label={field.label}
                        value={values[field.name] || (field.multiple ? [] : "")}
                        onChange={(e) => onChange(field.name, e.target.value)}
                        required={field.required ?? false}
                        multiple={field.multiple ?? false}
                        renderValue={(selected) => {
                          if (field.multiple) {
                            return selected
                              .map(
                                (id) =>
                                  field.options.find((opt) => opt.id === id)
                                    ?.label
                              )
                              .join(", ");
                          }
                          return field.options.find(
                            (opt) => opt.id === selected
                          )?.label;
                        }}
                      >
                        {field.options?.map((opt, i) => (
                          <MenuItem key={opt.id ?? i} value={opt.id}>
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
                    <LocalizationWrapper>
                      <DatePicker
                        value={values[field.name] ?? null}
                        onChange={(newValue) => onChange(field.name, newValue)}
                        format="DD/MM/YYYY"
                        slotProps={{
                          textField: {
                            error: Boolean(errors[field.name]),
                            helperText: errors[field.name] ?? "",
                          },
                        }}
                      />
                    </LocalizationWrapper>
                  );
                default:
                  if (field.type === "switch") {
                    return (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={Boolean(values[field.name])}
                            onChange={(e) => onChange(field.name, e.target.checked)}
                            name={field.name}
                            color="primary"
                          />
                        }
                        label={field.label}
                        labelPlacement="start"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                          margin: "0 auto",
                        }}
                      />
                    );
                  }
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
