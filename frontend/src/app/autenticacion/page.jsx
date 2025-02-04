"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation.js";
import MyForm from "../../components/Form.jsx";
import { Paper, Stack, Typography, ButtonGroup, Button } from "@mui/material";
import CONFIG from "../../../config/api.js";

export default function page() {
  const [showRegister, setShowRegister] = useState(true);
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formLoginValues, setFormLoginValues] = useState({
    email: "",
    password: "",
  });
  const [formRegisterValues, setFormRegisterValues] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  /* FORM LOGIN */
  const fieldsLogin = [
    { name: "email", label: "Email", type: "email", required: true },
    { name: "password", label: "Contraseña", type: "password", required: true },
  ];

  const router = useRouter();
  const handleChangeLogin = (fieldName, newValue) => {
    setFormLoginValues((prev) => ({
      ...prev,
      [fieldName]: newValue,
    }));
  };
  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setFormErrors({});
    try {
      console.log(formLoginValues);
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
      console.log("Login exitoso: ", data);
      router.push("/");
    } catch (err) {
      setErrorMessage(err.message);
      console.error("Error al loguear: ", err);
    }
  };
  /* FORM REGISTER */
  const fieldsRegister = [
    { name: "name", label: "Nombre", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "password", label: "Contraseña", type: "password", required: true },
    {
      name: "role",
      label: "Rol",
      type: "select",
      required: true,
      component: "select",
      options: [
        { id: 1, label: "Administrador" },
        { id: 2, label: "Coordinador" },
        { id: 3, label: "Recursos Humanos" },
      ],
    },
  ];
  const handleChangeRegister = (fieldName, newValue) => {
    setFormRegisterValues((prev) => ({
      ...prev,
      [fieldName]: newValue,
    }));
  };

  const handleSubmitRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setFormErrors({});
    try {
      console.log(formRegisterValues);
      const response = await fetch(`${CONFIG.API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formRegisterValues),
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
      console.log("Registro exitoso: ", data);
    } catch (err) {
      setErrorMessage(err.message);
      console.error("Error al registrar: ", err);
    }
  };
  function changeForm(show) {
    setShowRegister(show);
    setSuccessMessage(false);
    setErrorMessage(false);
    setFormErrors({});
  }

  return (
    <Stack
      sx={{
        height: "100%",
        width: "100%",
        maxWidth: 500,
        display: "flex",
        direction: "column",
        gap: "20px",
      }}
    >
      <Stack spacing={1}>
        <Typography variant="h4">Bienvenidos</Typography>
        <Typography variant="p">
          Registrate o inicia sesión para poder continuar.
        </Typography>
      </Stack>
      <ButtonGroup
        variant="contained"
        aria-label="Basic button group"
        fullWidth
      >
        <Button disabled={showRegister} onClick={() => changeForm(true)}>
          Registrarse
        </Button>
        <Button disabled={!showRegister} onClick={() => changeForm(false)}>
          Iniciar sesión
        </Button>
      </ButtonGroup>
      {showRegister ? (
        <>
          <Paper
            elevation={4}
            square={false}
            sx={{
              display: "flex",
              flexDirection: "column",
              p: 2,
              gap: 2,
              maxWidth: 500,
            }}
          >
            <Typography variant="h4">Registrarse</Typography>
            <MyForm
              fields={fieldsRegister}
              values={formRegisterValues}
              errors={formErrors}
              successMessage={successMessage}
              errorMessage={errorMessage}
              onChange={handleChangeRegister}
              onSubmit={handleSubmitRegister}
              buttonText={"Crear usuario"}
            />
          </Paper>
        </>
      ) : (
        <Paper
          elevation={4}
          square={false}
          sx={{
            display: "flex",
            flexDirection: "column",
            p: 2,
            gap: 2,
            maxWidth: 500,
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
            onSubmit={handleSubmitLogin}
            buttonText={"Iniciar sesión"}
          />
        </Paper>
      )}
    </Stack>
  );
}
