import React from "react";
import { Snackbar, Alert } from "@mui/material";
import { useDashboard } from "@/contexts/dashboard";
export default function MySnackbar({
  message = null,
  errorMessage = null,
  warningMessage = null,
  open,
}) {
  const {
    setOpenSnackbar,
    setSnackbarMessage,
    setSnackbarErrorMessage,
    setSnackbarWarningMessage,
  } = useDashboard();
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setSnackbarMessage("");
    setSnackbarErrorMessage("");
    setSnackbarWarningMessage("");
  };
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleCloseSnackbar}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert
        onClose={handleCloseSnackbar}
        severity={
          errorMessage
            ? "error"
            : message
              ? "success"
              : warningMessage
                ? "warning"
                : "info"
        }
        sx={{ width: "100%" }}
      >
        {errorMessage || message || warningMessage}
      </Alert>
    </Snackbar>
  );
}
