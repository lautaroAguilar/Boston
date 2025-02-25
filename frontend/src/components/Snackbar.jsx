import React from "react";
import { Snackbar, Alert } from "@mui/material";
import { useDashboard } from "@/contexts/dashboard";
export default function MySnackbar({
  message = null,
  errorMessage = null,
  open,
}) {
  const { setOpenSnackbar, setSnackbarMessage, setSnackbarErrorMessage } =
    useDashboard();
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setSnackbarMessage("");
    setSnackbarErrorMessage("");
  };
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleCloseSnackbar}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        onClose={handleCloseSnackbar}
        severity={errorMessage ? "error" : "success"}
        sx={{ width: "100%" }}
      >
        {errorMessage || message}
      </Alert>
    </Snackbar>
  );
}
