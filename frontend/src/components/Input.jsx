import React from "react";
import { FormControl, FormHelperText, Input, InputLabel } from "@mui/material";
export default function MyInput({
  inputId,
  inputLabel,
  placeholder,
  value,
  defaultValue,
  error,
  formHelperText,
  formHelperId,
}) {
  return (
    <FormControl>
      {inputLabel ? (
        <InputLabel htmlFor={inputId}>{inputLabel}</InputLabel>
      ) : (
        <></>
      )}
      <Input
        id={inputId}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        error={error}
      />
      {formHelperText ? (
        <FormHelperText id={formHelperId}>{formHelperText}</FormHelperText>
      ) : (
        <></>
      )}
    </FormControl>
  );
}
