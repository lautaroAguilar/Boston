"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import MyForm from "../../components/Form.jsx";
import { Paper, Stack, Typography, Button } from "@mui/material";
import CONFIG from "../../../config/api.js";

export default function page() {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formLoginValues, setFormLoginValues] = useState({
    email: "",
    password: "",
  });
  const fieldsLogin = [
    { name: "email", label: "Email", type: "email", required: true },
    { name: "password", label: "Contraseña", type: "password", required: true },
  ];
  const handleChangeLogin = (fieldName, newValue) => {
    setFormLoginValues((prev) => ({
      ...prev,
      [fieldName]: newValue,
    }));
  };
  const handleSubmitLogin = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setFormErrors({});
    try {
      const response = await fetch(`${CONFIG.API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formLoginValues),
      });
      if (!response.ok) {
        const errorData = await response.json();
        /* CREAMOS OBJETO DE ERRORES PARA PASAR AL FORM COMPONENT */
        if (Array.isArray(errorData)) {
          const errorObj = errorData.reduce((acc, issue) => {
            const fieldName = issue.path[0];
            acc[fieldName] = issue.message;
            return acc;
          }, {});
          setFormErrors(errorObj);
        } else {
          setErrorMessage(errorData.message || "Error desconocido");
        }
        return;
      }
      const data = await response.json();
      setSuccessMessage(data.message);
      router.push("/inicio");
      return true;
    } catch (err) {
      setErrorMessage("Hubo un error al iniciar sesión");
      console.error("Error al loguear: ", err);
    }
  };

  return (
    <Stack
      sx={{
        height: "100%",
        width: "100%",
        maxWidth: 500,
        display: "flex",
        direction: "column",
        justifyContent: "center",
        gap: "20px",
      }}
    >
      <Stack spacing={1}>
        <Typography variant="h4">Bienvenidos</Typography>
        <Typography variant="p">
          Inicia sesión con tus credenciales para poder continuar.
        </Typography>
      </Stack>
      <Paper
        elevation={4}
        square={false}
        sx={{
          height: "60%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          p: 2,
          gap: 2,
          maxWidth: 500,
          maxHeight: 600,
          overflowY: "auto",
          scrollbarWidth: "thin",
        }}
      >
        <Typography variant="h4">Iniciar Sesión</Typography>
        <MyForm
          fields={fieldsLogin}
          values={formLoginValues}
          errors={formErrors}
          successMessage={successMessage}
          errorMessage={errorMessage}
          onChange={handleChangeLogin}
        />
        <Button variant="contained" onClick={handleSubmitLogin}>
          Iniciar sesión
        </Button>
      </Paper>
    </Stack>
  );
}
