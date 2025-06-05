"use client";
import React, { useEffect, useState } from "react";
import { Paper, Typography, Button, useMediaQuery, Modal } from "@mui/material";
import { FileDownloadOutlined, PersonAddRounded } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import MyForm from "@/components/Form";
import { useDashboard } from "@/contexts/dashboard";
import { useTeacher } from "@/contexts/teachers";
import { useExcelExport } from "@/hooks/useExcelExport";
import ExportProgressDialog from "@/components/ExportProgressDialog";

export default function Page() {
  const theme = createTheme(esES);
  const isMobile = useMediaQuery("(max-width:600px)");
  const {
    setToolbarButtonAction,
    setToolbarExportAction,
    snackbarMessage,
    snackbarErrorMessage,
    setOpenSnackbar,
    fetchProfessionalCategories,
    fetchLanguages,
    professionalCategories,
    languages,
  } = useDashboard();

  const {
    teachers,
    formErrors,
    teacherCreated,
    handleSubmitTeacher,
    fetchTeachers,
  } = useTeacher();

  const { 
    exportDataGridToExcel, 
    isExporting, 
    exportProgress 
  } = useExcelExport();

  const [showForm, setShowForm] = useState(false);
  const [formRegisterValues, setFormRegisterValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    CBU: "",
    CUIT: "",
    professionalCategoryId: "",
    languages: [],
    fictitiousSeniority: "",
    bostonSeniority: "",
    observations: "",
  });

  function handleShowForm() {
    setShowForm(true);
  }

  const handleExportToExcel = async () => {
    await exportDataGridToExcel(
      teachers,
      teacherColumns,
      'Docentes',
      {
        customProcessing: (row, columns) => {
          // Procesamiento personalizado para campos específicos
          const processedRow = {};
          columns.forEach(column => {
            let value = row[column.field];
            
            // Procesar arrays de idiomas
            if (column.field === 'languages' && Array.isArray(value)) {
              value = value.map(lang => lang.name || lang).join(', ');
            }
            
            processedRow[column.headerName || column.field] = value || '';
          });
          return processedRow;
        }
      }
    );
  };

  const handleChangeRegister = (fieldName, newValue) => {
    setFormRegisterValues((prev) => ({
      ...prev,
      [fieldName]: newValue,
    }));
  };

  const handleSubmitRegister = async () => {
    const result = await handleSubmitTeacher(formRegisterValues);
    if (result) {
      setShowForm(false);
      setFormRegisterValues({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        CBU: "",
        CUIT: "",
        professionalCategoryId: "",
        languages: [],
        fictitiousSeniority: "",
        bostonSeniority: "",
        observations: "",
      });
    }
  };

  const teacherColumns = [
    { field: "id", headerName: "ID", minWidth: 50 },
    { field: "firstName", headerName: "Nombre", minWidth: 150, flex: 1 },
    { field: "lastName", headerName: "Apellido", minWidth: 150, flex: 1 },
    { field: "email", headerName: "Email", minWidth: 200, flex: 1 },
    { field: "phone", headerName: "Teléfono", minWidth: 150, flex: 1 },
    {
      field: "CBU",
      headerName: "CBU",
      minWidth: 150,
      flex: 1,
    },
    {
      field: "CUIT",
      headerName: "CUIT",
      minWidth: 150,
      flex: 1,
    },
  ];

  const fieldsRegister = [
    { name: "firstName", label: "Nombre", required: true },
    { name: "lastName", label: "Apellido", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Teléfono" },
    { name: "CBU", label: "CBU", required: true },
    { name: "CUIT", label: "CUIT", required: true },
    {
      name: "professionalCategoryId",
      label: "Categoría Profesional",
      type: "select",
      component: "select",
      options: professionalCategories?.map((category) => ({
        id: category.id,
        label: category.name,
      })),
      required: true,
    },
    {
      name: "languages",
      label: "Idiomas",
      type: "select",
      component: "select",
      multiple: true,
      options: languages?.map((language) => ({
        id: language.id,
        label: language.name,
      })),
      required: true,
    },
    {
      name: "fictitiousSeniority",
      label: "Antigüedad Ficticia",
      required: true,
    },
    { name: "bostonSeniority", label: "Antigüedad en Boston", required: true },
    { name: "observations", label: "Observaciones", required: true },
  ];

  useEffect(() => {
    setToolbarButtonAction({
      label: "Crear nuevo",
      action: handleShowForm,
      icon: <PersonAddRounded />,
    });

    setToolbarExportAction({
      label: "Exportar Excel",
      action: handleExportToExcel,
      icon: <FileDownloadOutlined />,
      disabled: isExporting || teachers.length === 0,
    });
  }, [setToolbarButtonAction, setToolbarExportAction, isExporting, teachers]);

  useEffect(() => {
    if (snackbarMessage || snackbarErrorMessage) {
      setOpenSnackbar(true);
    }
  }, [snackbarMessage, snackbarErrorMessage]);

  useEffect(() => {
    fetchTeachers();
    fetchProfessionalCategories();
    fetchLanguages();
  }, [teacherCreated]);

  return (
    <>
      <ThemeProvider theme={theme}>
        <DataGrid
          columns={teacherColumns}
          rows={teachers}
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
            overflowY: "auto",
            scrollbarWidth: "thin",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Typography variant="h4">Crear nuevo docente</Typography>
          <MyForm
            fields={fieldsRegister}
            values={formRegisterValues}
            errors={formErrors}
            onChange={handleChangeRegister}
          />
          <Button variant="contained" onClick={handleSubmitRegister}>
            Crear docente
          </Button>
        </Paper>
      </Modal>

      <ExportProgressDialog 
        open={isExporting}
        progress={exportProgress}
        isExporting={isExporting}
        onClose={() => {}}
      />
    </>
  );
}
