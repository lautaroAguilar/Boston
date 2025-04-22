"use client";
import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import "moment/locale/es";

export default function LocalizationWrapper({ children }) {
  return (
    <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="es">
      {children}
    </LocalizationProvider>
  );
}
