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
import { useCompany } from "@/contexts/companies";
import { useAuth } from "@/contexts/auth";
import OptionsButton from "@/components/OptionsButton";
import { Edit, Delete, PowerSettingsNew, Check } from "@mui/icons-material";

export default function page() {
  const { users, getUsers, updateUserStatus } = useAuth();
  const theme = createTheme(esES);
  const isMobile = useMediaQuery("(max-width:600px)");
  const {
    setSnackbarErrorMessage,
    setToolbarButtonAction,
    setSnackbarMessage,
    snackbarMessage,
    snackbarErrorMessage,
    setOpenSnackbar,
    roles,
    fetchRoles
  } = useDashboard();
  const { companiesInfo } = useCompany();
  const [showForm, setShowForm] = useState(false);
  const [created, setCreated] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formRegisterValues, setFormRegisterValues] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role_id: "",
    belongs_to: "",
  });

  useEffect(() => {
    if (!roles || roles.length === 0) {
      fetchRoles();
    }
  }, []);

  const fieldsRegister = [
    { name: "first_name", label: "Nombre", required: true },
    { name: "last_name", label: "Apellido", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "password", label: "Contraseña", type: "password", required: true },
    {
      name: "role_id",
      label: "Rol",
      type: "select",
      required: true,
      component: "select",
      options: roles
        ? roles?.filter(role => role.id !== 3).map((role) => ({ id: role.id, label: role.name }))
        : [{ id: 0, label: "No se encontraron roles" }],
    },
    {
      name: "belongs_to",
      label: "Pertenece a la empresa",
      type: "select",
      component: "select",
      options: companiesInfo
        ? companiesInfo?.map((c) => ({ id: c.name, label: c.name }))
        : [{ id: 0, label: "No se encontraron empresas" }],
    },
  ];
  function handleShowForm() {
    setShowForm(true);
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
  const userColumns = [
    { field: "id", headerName: "ID", minWidth: 50 },
    { field: "first_name", headerName: "Nombre", minWidth: 150, flex: 1 },
    { field: "last_name", headerName: "Apellido", minWidth: 150, flex: 1 },
    { field: "email", headerName: "Email", minWidth: 200, flex: 1 },
    {
      field: "role_id",
      headerName: "Rol",
      minWidth: 150,
      flex: 1,
      renderCell: (params) => {
        const roleFound = Array.isArray(roles) 
          ? roles.find((role) => role.id === params.value)
          : null;
        return roleFound ? roleFound.name : "Desconocido";
      },
    },
    { field: "belongs_to", headerName: "Empresa", minWidth: 150, flex: 1 },
    {
      field: "active",
      headerName: "Estado",
      minWidth: 120,
      flex: 1,
      renderCell: (params) => {
        const isActive = params.row.active !== false && params.row.active !== 0;
        return (
          <Typography
            variant="body2"
            sx={{
              color: isActive ? 'success.main' : 'error.main',
              fontWeight: 'bold'
            }}
          >
            {isActive ? 'Activo' : 'Inactivo'}
          </Typography>
        );
      },
    },
    {
      field: "actions",
      headerName: "Acciones",
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const isActive = params.row.active !== false && params.row.active !== 0;
        
        const handleToggleStatus = async (row) => {
          const newStatus = !isActive;
          const success = await updateUserStatus(row.id, newStatus);
          if (success) {
            setSnackbarMessage(`Usuario ${isActive ? 'desactivado' : 'activado'} correctamente`);
            setOpenSnackbar(true);
            setCreated(true);
          } else {
            setSnackbarErrorMessage(`Error al ${isActive ? 'desactivar' : 'activar'} el usuario`);
            setOpenSnackbar(true);
          }
        };

        const options = [
          {
            label: isActive ? "Desactivar" : "Activar",
            icon: isActive ? <PowerSettingsNew fontSize="small" color="error" /> : <Check fontSize="small" color="success" />,
            onClick: handleToggleStatus
          }
        ];

        return <OptionsButton options={options} row={params.row} />;
      },
    },
  ];
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
            height: "90%",
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
