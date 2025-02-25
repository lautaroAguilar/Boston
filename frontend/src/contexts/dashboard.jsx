"use client";
import { createContext, useContext, useState } from "react";

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const [toolbarButtonAction, setToolbarButtonAction] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarErrorMessage, setSnackbarErrorMessage] = useState("");
  return (
    <DashboardContext.Provider
      value={{
        toolbarButtonAction,
        openSnackbar,
        snackbarMessage,
        snackbarErrorMessage,
        setToolbarButtonAction,
        setOpenSnackbar,
        setSnackbarMessage,
        setSnackbarErrorMessage,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  return useContext(DashboardContext);
}
