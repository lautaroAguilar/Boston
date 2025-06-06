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
  RadioGroup,
  Radio,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import LocalizationWrapper from "./LocalizationWrapper";
import { TimePicker } from '@mui/x-date-pickers';

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
                        label={field.label}
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
                case "time":
                  return (
                    <LocalizationWrapper>
                      <TimePicker
                        label={field.label}
                        value={values[field.name] ?? null}
                        onChange={(newValue) => onChange(field.name, newValue)}
                        format="HH:mm"
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
                  } else if (field.type === "radio") {
                    return (
                      <FormControl component="fieldset" fullWidth>
                        <Typography variant="body2" color="text.secondary" gutterBottom>{field.label}</Typography>
                        <RadioGroup
                          row
                          name={field.name}
                          value={values[field.name]?.toString() ?? ''}
                          onChange={(e) => {
                            const newValue = field.options.find(opt => opt.value.toString() === e.target.value)?.value;
                            onChange(field.name, newValue);
                          }}
                        >
                          {field.options?.map((option, i) => (
                            <FormControlLabel
                              key={option.value ?? i}
                              value={option.value.toString()}
                              control={<Radio />}
                              label={option.label}
                            />
                          ))}
                        </RadioGroup>
                        {errors && errors[field.name] && (
                          <FormHelperText>{errors[field.name]}</FormHelperText>
                        )}
                      </FormControl>
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
