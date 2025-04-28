"use client";
import React, { useEffect, useState } from "react";
import FormStepper from "@/components/Stepper";
import { Modal, Paper, Typography, Stack, useMediaQuery } from "@mui/material";
import { SchoolRounded, Edit, Delete, Visibility } from "@mui/icons-material";
import { useDashboard } from "@/contexts/dashboard";
import { useStudent } from "@/contexts/students";
import { useCompany } from "@/contexts/companies";
import { DataGrid } from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import moment from "moment";
import OptionsButton from "@/components/OptionsButton";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
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
    languages,
    modules,
  } = useDashboard();
  const { fetchStudents, students, createStudent, updated } = useStudent();
  const isMobile = useMediaQuery("(max-width:600px)");
  /* ESTADOS */
  const [showForm, setShowForm] = useState(false);
  const [step1Values, setStep1Values] = useState({
    first_name: "",
    last_name: "",
    email: "",
    company_id: "",
    cost_center_id: "",
    sector_id: "",
    sid: "",
  });
  const [step2Values, setStep2Values] = useState({
    initial_leveling_date: moment(),
    language_id: "",
    module_id: "",
  });

  /* COLUMNAS PARA EL DATAGRID DE ESTUDIANTES */
  const studentColumns = [
    { field: "student_id", headerName: "ID", minWidth: 50 },
    { field: "first_name", headerName: "Nombre", minWidth: 150, flex: 1 },
    { field: "last_name", headerName: "Apellido", minWidth: 150, flex: 1 },
    {
      field: "module",
      headerName: "Módulo actual",
      minWidth: 150,
      flex: 1,
      renderCell: (params) =>
        params?.row?.current_module_name || "Sin módulo asignado",
    },
    {
      field: "languages",
      headerName: "Idioma",
      minWidth: 150,
      flex: 1,
      renderCell: (params) =>
        params?.row?.current_language_name || "Sin idioma asignado",
    },
    { field: "company_name", headerName: "Empresa", minWidth: 150, flex: 1 },
    {
      field: "cost_center_name",
      headerName: "Centro de Costo",
      minWidth: 150,
      flex: 1,
    },
    { field: "sector_name", headerName: "Sector", minWidth: 150, flex: 1 },
    { field: "sid", headerName: "SID", minWidth: 150, flex: 1 },
    {
      field: "actions",
      headerName: "",
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const handleView = (row) => {
          router.push(`/estudiantes/${row.student_id}`);
          // Implementar lógica para ver detalles
        };

        const handleEdit = (row) => {
          // Falta implementar lógica para editar
        };

        const handleDelete = (row) => {
          // Falta implementar lógica para eliminar
        };

        const options = [
          {
            label: "Ir a detalle",
            onClick: handleView,
          },
          /* { 
          label: "Editar", 
          icon: <Edit fontSize="small" />, 
          onClick: handleEdit 
        },
        { 
          label: "Eliminar", 
          icon: <Delete fontSize="small" />, 
          onClick: handleDelete 
        }, */
        ];

        return <OptionsButton options={options} row={params.row} />;
      },
    },
  ];

  function handleShowForm() {
    setShowForm(true);
  }

  const steps = [
    {
      label: "Datos Personales",
      description: "Completa los datos personales del alumno",
      fields: [
        { name: "first_name", label: "Nombre", required: true },
        { name: "last_name", label: "Apellido", required: true },
        { name: "email", label: "Email", required: true, type: "email" },
        {
          name: "cost_center_id",
          label: "Centro de Costo",
          component: "select",
          options: selectedCompany
            ? costCenters?.map((cc) => ({
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
          options: selectedCompany
            ? sectors?.map((sector) => ({
                id: sector.sector_id,
                label: sector.sector_name,
              }))
            : [{ id: 0, label: "No se encontraron sectores" }],
          required: true,
        },
        { name: "sid", label: "SID" },
      ],
      values: step1Values,
      setValues: setStep1Values,
    },
    {
      label: "Detalles de Nivelación",
      fields: [
        {
          name: "initial_leveling_date",
          label: "Fecha de Nivelación",
          component: "date",
          required: true,
        },
        {
          name: "language_id",
          label: "Idioma",
          component: "select",
          options: languages?.map((lang) => ({
            id: lang.id,
            label: lang.name,
          })),
          required: true,
        },
        {
          name: "module_id",
          label: "Módulo y Nivel",
          component: "select",
          options: modules?.map((mod) => ({ id: mod.id, label: mod.name })),
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
      initial_leveling_date: step2Values.initial_leveling_date,
      languages: [
        {
          language_id: step2Values.language_id,
          module_id: step2Values.module_id,
        },
      ],
      company_id: selectedCompany,
    };

    await createStudent(studentData);
    if (snackbarMessage) {
      setShowForm(false);
      setStep1Values({
        first_name: "",
        last_name: "",
        email: "",
        company_id: "",
        cost_center_id: "",
        sector_id: "",
        sid: "",
      });
      setStep2Values({
        initial_leveling_date: moment(),
        language_id: "",
        module_id: "",
      });
    }
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
