"use client";
import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Button,
  useMediaQuery,
  Modal,
  Box,
} from "@mui/material";
import GroupAddRoundedIcon from "@mui/icons-material/GroupAddRounded";
import { DataGrid } from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import MyForm from "@/components/Form";
import { useDashboard } from "@/contexts/dashboard";
import { useGroup } from "@/contexts/groups";
import { useTeacher } from "@/contexts/teachers";
import { useStudent } from "@/contexts/students";
export default function Page() {
  const theme = createTheme(esES);
  const isMobile = useMediaQuery("(max-width:600px)");
  const {
    setToolbarButtonAction,
    snackbarMessage,
    snackbarErrorMessage,
    setOpenSnackbar,
    selectedCompany,
    languages,
    modules,
    modalities,
    fetchModules,
    fetchLanguages,
    fetchModalities,
  } = useDashboard();

  const { groups, formErrors, groupCreated, handleSubmitGroup, fetchGroups } =
    useGroup();

  const { fetchTeachers, teachers } = useTeacher();
  const { fetchStudents, students } = useStudent();

  const [showForm, setShowForm] = useState(false);
  const [formRegisterValues, setFormRegisterValues] = useState({
    name: "",
    teacherId: "",
    languageId: "",
    moduleId: "",
    modalityId: "",
    startDate: null,
    endDate: null,
    students: [],
  });

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
    const result = await handleSubmitGroup(formRegisterValues, selectedCompany);
    if (result) {
      setShowForm(false);
      setFormRegisterValues({
        name: "",
        teacherId: "",
        languageId: "",
        moduleId: "",
        modalityId: "",
        startDate: null,
        endDate: null,
        students: [],
      });
    }
  };

  const groupColumns = [
    { field: "id", headerName: "ID", minWidth: 50 },
    { field: "name", headerName: "Nombre", minWidth: 150, flex: 1 },
    {
      field: "teacher",
      headerName: "Docente",
      minWidth: 150,
      flex: 1,
      renderCell: (params) => {
        return `${params.value.firstName} ${params.value.lastName}`;
      },
    },
    {
      field: "language",
      headerName: "Idioma",
      minWidth: 150,
      flex: 1,
      renderCell: (params) => params.value.name,
    },
    {
      field: "module",
      headerName: "Nivel y Módulo",
      minWidth: 120,
      flex: 1,
      renderCell: (params) => params.value.name,
    },
    {
      field: "modality",
      headerName: "Modalidad",
      minWidth: 150,
      flex: 1,
      renderCell: (params) => params.value.name,
    },
    {
      field: "status",
      headerName: "Estado",
      minWidth: 100,
      flex: 1,
      renderCell: (params) => params.value.name,
    },
    {
      field: "students",
      headerName: "Estudiantes",
      minWidth: 150,
      flex: 1,
      renderCell: (params) => {
        return params.value.map((s) => `${s.student.first_name} ${s.student.last_name}`).join(", ");
      },
    },
  ];

  const fieldsRegister = [
    { name: "name", label: "Nombre del Grupo", required: true },
    {
      name: "teacherId",
      label: "Docente",
      type: "select",
      component: "select",
      options: teachers?.map((teacher) => ({
        id: teacher.id,
        label: `${teacher.firstName} ${teacher.lastName}`,
      })),
      required: true,
    },
    {
      name: "languageId",
      label: "Idioma",
      type: "select",
      component: "select",
      options: languages?.map((language) => ({
        id: language.id,
        label: language.name,
      })),
      required: true,
    },
    {
      name: "moduleId",
      label: "Módulo",
      type: "select",
      component: "select",
      options: modules?.map((module) => ({
        id: module.id,
        label: module.name,
      })),
      required: true,
    },
    {
      name: "modalityId",
      label: "Modalidad",
      type: "select",
      component: "select",
      options: modalities?.map((modality) => ({
        id: modality.id,
        label: modality.name,
      })),
      required: true,
    },
    {
      name: "startDate",
      label: "Fecha de Inicio",
      type: "date",
      required: true,
    },
    { name: "endDate", label: "Fecha de Fin", type: "date", required: true },
    {
      name: "students",
      label: "Estudiantes",
      type: "select",
      component: "select",
      multiple: true,
      options: students?.map((student) => ({
        id: student.student_id,
        label: `${student.first_name} ${student.last_name}`,
      })),
      required: true,
    },
  ];

  useEffect(() => {
    setToolbarButtonAction({
      label: "Crear nuevo",
      action: handleShowForm,
      icon: <GroupAddRoundedIcon />,
    });
  }, [setToolbarButtonAction]);

  useEffect(() => {
    if (snackbarMessage || snackbarErrorMessage) {
      setOpenSnackbar(true);
    }
  }, [snackbarMessage, snackbarErrorMessage]);

  useEffect(() => {
    fetchGroups();
    fetchModalities();
    fetchModules();
    fetchLanguages();
    fetchTeachers();
    fetchStudents();
  }, [groupCreated]);

  return (
    <>
      <ThemeProvider theme={theme}>
        <DataGrid
          columns={groupColumns}
          rows={groups}
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
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Typography variant="h4">Crear nuevo grupo</Typography>
          <Box
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              scrollbarWidth: "thin",
              mb: 2,
            }}
          >
            <MyForm
              fields={fieldsRegister}
              values={formRegisterValues}
              errors={formErrors}
              onChange={handleChangeRegister}
            />
          </Box>
          <Box sx={{ mt: "auto" }}>
            <Button
              variant="contained"
              onClick={handleSubmitRegister}
              fullWidth
            >
              Crear grupo
            </Button>
          </Box>
        </Paper>
      </Modal>
    </>
  );
}
