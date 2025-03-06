"use client";
import React, { useEffect, useState } from "react";
import { Paper, Typography, Button, useMediaQuery, Modal } from "@mui/material";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import { DataGrid } from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import MyForm from "@/components/Form";
import CONFIG from "../../../../config/api";
import { useDashboard } from "@/contexts/dashboard";
const userColumns = [
  { field: "id", headerName: "ID", minWidth: 50 },
  { field: "name", headerName: "Nombre", minWidth: 150, flex: 1 },
  { field: "email", headerName: "Email", minWidth: 200, flex: 1 },
];
export default function page() {
  const theme = createTheme(esES);
  const isMobile = useMediaQuery("(max-width:600px)");
  const {
    setSnackbarErrorMessage,
    setToolbarButtonAction,
    setSnackbarMessage,
    snackbarMessage,
    snackbarErrorMessage,
    setOpenSnackbar,
  } = useDashboard();

  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState(false);
  const [roles, setRoles] = useState(false);
  const [created, setCreated] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formRegisterValues, setFormRegisterValues] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  async function getRoles() {
    try {
      const response = await fetch(`${CONFIG.API_URL}/settings/roles`);
      const data = await response.json();
      setRoles(data);
      return;
    } catch (error) {
      console.log(error);
    }
  }
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
      options: roles
        ? roles.map((role) => ({ id: role.id, label: role.name }))
        : [{ id: 0, label: "No se encontraron roles" }],
    },
  ];
  function handleShowForm() {
    setShowForm(true);
    getRoles();
  }
  const handleChangeRegister = (fieldName, newValue) => {
    setFormRegisterValues((prev) => ({
      ...prev,
      [fieldName]: newValue,
    }));
  };
  const handleSubmitRegister = async () => {
    setFormErrors({});
    try {
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
          setSnackbarErrorMessage(errorData.message || "Error desconocido");
        }
        return;
      }
      const data = await response.json();
      setSnackbarMessage(data.message);
      setCreated(true);
      setShowForm(false);
      return;
    } catch (err) {
      setSnackbarErrorMessage(err.message);
      console.error("Error al registrar: ", err);
    }
  };
  const getUsers = async () => {
    try {
      const res = await fetch(`${CONFIG.API_URL}/user`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setSnackbarErrorMessage(data.message);
        return;
      }
      setUsers(data);
      return;
    } catch (error) {
      console.log("error al buscar usuarios", error);
    }
  };
  useEffect(() => {
    setToolbarButtonAction({
      label: "Crear nuevo",
      action: handleShowForm,
      icon: <PersonAddRoundedIcon />,
    });
  }, [setToolbarButtonAction]);
  useEffect(() => {
    if (snackbarMessage || snackbarErrorMessage) {
      setOpenSnackbar(true);
    }
  }, [snackbarMessage, snackbarErrorMessage]);
  useEffect(() => {
    getUsers();
  }, [created]);
  return (
    <>
      <ThemeProvider theme={theme}>
        <DataGrid
          columns={userColumns}
          rows={users}
          getRowId={(row) => row.id}
          getEstimatedRowHeight={() => 100}
          getRowHeight={() => "auto"}
          sx={{
            width: "100%",
            "&.MuiDataGrid-root--densityCompact .MuiDataGrid-cell": {
              py: 1,
            },
            "&.MuiDataGrid-root--densityStandard .MuiDataGrid-cell": {
              py: "15px",
            },
            "&.MuiDataGrid-root--densityComfortable .MuiDataGrid-cell": {
              py: "22px",
            },
          }}
        />
      </ThemeProvider>
      <Modal
        open={showForm}
        onClose={() => {
          setShowForm(false);
        }}
        sx={{ height: "100%" }}
      >
        <Paper
          elevation={4}
          square={false}
          sx={{
            height: "70%",
            width: isMobile ? "90%" : "50%",
            display: "flex",
            flexDirection: "column",
            p: 2,
            gap: 2,
            maxWidth: 500,
            maxHeight: 600,
            overflowY: "auto",
            scrollbarWidth: "thin",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Typography variant="h4">Crear nuevo usuario</Typography>
          <MyForm
            fields={fieldsRegister}
            values={formRegisterValues}
            errors={formErrors}
            onChange={handleChangeRegister}
          />
          <Button variant="contained" onClick={handleSubmitRegister}>
            Crear usuario
          </Button>
        </Paper>
      </Modal>
    </>
  );
}
