"use client";
import React, { useEffect, useState } from "react";
import FormStepper from "@/components/Stepper";
import { Modal, Paper, Typography, Stack, useMediaQuery } from "@mui/material";
import { SchoolRounded } from "@mui/icons-material";
import { useDashboard } from "@/contexts/dashboard";
import { useStudent } from "@/contexts/students";
import { useCompany } from "@/contexts/companies";
import {
  studentStepOneSchema,
  studentStepTwoSchema,
} from "../../../../schemas/students";
import { DataGrid } from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import { createTheme, ThemeProvider } from "@mui/material/styles";

/* COLUMNAS PARA EL DATAGRID DE ESTUDIANTES */
const studentColumns = [
  { field: "student_id", headerName: "ID", minWidth: 50, },
  { field: "first_name", headerName: "Nombre", minWidth: 150, flex: 1 },
  { field: "last_name", headerName: "Apellido", minWidth: 150, flex: 1 },
  { field: "email", headerName: "Email", minWidth: 200, flex: 1 },
  { field: "company_name", headerName: "Empresa", minWidth: 150, flex: 1 },
  { field: "cost_center_name", headerName: "Centro de Costo", minWidth: 150, flex: 1 },
  { field: "sector_name", headerName: "Sector", minWidth: 150, flex: 1 },
];

export default function Page() {
  const theme = createTheme(esES);
  const { fetchCostCenters, fetchSectors, sectors, costCenters } = useCompany();
  const {
    setToolbarButtonAction,
    setOpenSnackbar,
    snackbarMessage,
    snackbarErrorMessage,
    selectedCompany,
    fetchModules,
    fetchLanguages,
    fetchLevels,
    languages,
    levels,
    modules,
  } = useDashboard();
  const { fetchStudents, students, createStudent, updated } = useStudent();
  const isMobile = useMediaQuery("(max-width:600px)");
  /* ESTADOS */
  const [showForm, setShowForm] = useState(false);
  const [studentCreated, setStudentCreated] = useState(false);
  const [step1Values, setStep1Values] = useState({
    first_name: "",
    last_name: "",
    email: "",
    company_id: "",
    cost_center_id: "",
    sector_id: "",
  });

  const [step2Values, setStep2Values] = useState({
    initial_leveling_date: "",
    language_id: "",
    module_id: "",
    level_id: "",
  });

  function handleShowForm() {
    setShowForm(true);
  }

  const steps = [
    {
      label: "Datos Personales",
      description: "Completa los datos personales del alumno",
      schema: studentStepOneSchema,
      fields: [
        { name: "first_name", label: "Nombre", required: true },
        { name: "last_name", label: "Apellido", required: true },
        { name: "email", label: "Email", required: true, type: "email" },
        {
          name: "cost_center_id",
          label: "Centro de Costo",
          component: "select",
          options:
            selectedCompany
              ? costCenters.map((cc) => ({
                  id: cc.cost_center_id,
                  label: cc.cost_center_name,
                }))
              : [{ id: 0, label: "No se encontraron centros de costo" }],
          required: true,
        },
        {
          name: "sector_id",
          label: "Sector",
          component: "select",
          options:
            selectedCompany
              ? sectors.map((sector) => ({
                  id: sector.sector_id,
                  label: sector.sector_name,
                }))
              : [{ id: 0, label: "No se encontraron sectores" }],
          required: true,
        },
      ],
      values: step1Values,
      setValues: setStep1Values,
    },
    {
      label: "Detalles de Nivelación",
      schema: studentStepTwoSchema,
      fields: [
        {
          name: "initial_leveling_date",
          label: "Fecha de Nivelación",
          type: "date",
          required: true,
        },
        {
          name: "language_id",
          label: "Idioma",
          component: "select",
          options: languages.map((lang) => ({ id: lang.id, label: lang.name })),
          required: true,
        },
        {
          name: "module_id",
          label: "Módulo",
          component: "select",
          options: modules.map((mod) => ({ id: mod.id, label: mod.name })),
          required: true,
        },
        {
          name: "level_id",
          label: "Nivel",
          component: "select",
          options: levels.map((lvl) => ({ id: lvl.id, label: lvl.name })),
          required: true,
        },
      ],
      values: step2Values,
      setValues: setStep2Values,
    },
  ];
  const handleFinish = async () => {
    const studentData = {
      ...step1Values,
      ...step2Values,
      company_id: selectedCompany,
    };
    await createStudent(studentData);
    setShowForm(false);
  };
  useEffect(() => {
    setToolbarButtonAction({
      label: "Crear nuevo",
      action: handleShowForm,
      icon: <SchoolRounded />,
    });
  }, [setToolbarButtonAction]);
  useEffect(() => {
    if (snackbarMessage || snackbarErrorMessage) {
      setOpenSnackbar(true);
    }
  }, [snackbarMessage, snackbarErrorMessage]);
  useEffect(() => {
    fetchStudents();
  }, [updated, selectedCompany]);
  useEffect(() => {
    if (selectedCompany) {
      fetchCostCenters(selectedCompany);
      fetchSectors(selectedCompany);
    }
    fetchModules();
    fetchLanguages();
    fetchLevels();
  }, [selectedCompany]);
  return (
    <Stack>
      <ThemeProvider theme={theme}>
        <DataGrid
          columns={studentColumns}
          rows={students}
          getRowId={(row) => row.student_id}
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
            height: "80%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            p: 2,
            gap: 2,
            width: isMobile ? "90%" : "50%",
            maxWidth: 650,
            maxHeight: 600,
            overflowY: "auto",
            scrollbarWidth: "thin",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Typography variant="h5">Agregar nuevo alumno</Typography>
          <FormStepper steps={steps} onFinish={handleFinish} />
        </Paper>
      </Modal>
    </Stack>
  );
}
