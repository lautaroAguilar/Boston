"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Box, Paper, Typography, Divider, Stack, Button, Switch, FormControlLabel } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { FileDownloadOutlined } from "@mui/icons-material";
import { useStudent } from "@/contexts/students";
import { useDashboard } from "@/contexts/dashboard";
import { formatDate } from "@/utils/dateUtils";

export default function StudentDetail() {
  const { id } = useParams();
  const { fetchStudentById, student, updateStudent } = useStudent();
  const {
    snackbarErrorMessage,
    snackbarMessage,
    snackbarWarningMessage,
    setOpenSnackbar,
    setToolbarButtonAction,
  } = useDashboard();
  const [enrollments, setEnrollments] = useState([]);
  const [isActive, setIsActive] = useState(true);
  
  // Estado local para manejar los cambios visuales de los certificados
  const [certificateStates, setCertificateStates] = useState({});
  
  const handleCertificateChange = (enrollmentId, newValue) => {
    setCertificateStates(prev => ({
      ...prev,
      [enrollmentId]: newValue
    }));
  };

  const handleActiveChange = (event) => {
    const newActive = event.target.checked;
    setIsActive(newActive);
    updateStudent(id, { active: newActive });
  };

  const handleExportExcel = () => {
    console.log("Exportando a Excel...");
    // Implementar lógica de exportación
  };

  const handleAddRecord = () => {
    console.log("Agregando nuevo registro...");
    // Implementar lógica para agregar un nuevo registro
  };

  const columns = [
    {
      field: "startDate",
      headerName: "Fecha de inicio",
      flex: 1,
      renderCell: (params) => formatDate(params.row.startDate),
    },
    { field: "language_name", headerName: "Idioma", flex: 1 },
    { field: "module_name", headerName: "Módulo", flex: 1 },
    /* { field: "last_achieved", headerName: "Último alcanzado", flex: 1 }, */
    {
      field: "teacher_name",
      headerName: "Docente",
      flex: 1,
      renderCell: (params) => {
        if (params.row?.teacher_first_name && params.row?.teacher_last_name) {
          return `${params.row?.teacher_first_name} ${params.row?.teacher_last_name}`;
        }
        return "Sin docente";
      },
    },
    { 
      field: "certificate_sent", 
      headerName: "Certificado enviado", 
      flex: 1,
      renderCell: (params) => {
        // Usar el estado local si existe, de lo contrario usar el valor original
        const isChecked = certificateStates.hasOwnProperty(params.row.id) 
          ? certificateStates[params.row.id] 
          : Boolean(params.row.certificate_sent);
        
        return (
          <FormControlLabel
            control={
              <Switch 
                checked={isChecked} 
                onChange={(e) => handleCertificateChange(params.row.id, e.target.checked)}
                color="primary"
              />
            }
            label={isChecked ? "Sí" : "No"}
          />
        );
      }
    },
    {
      field: "status",
      headerName: "Estado",
      flex: 1,
      renderCell: (params) => {
        return params.row.status === "active" ? "Activo" : "Inactivo";
      },
    },
  ];

  useEffect(() => {
    if (snackbarMessage || snackbarErrorMessage || snackbarWarningMessage) {
      setOpenSnackbar(true);
    }
  }, [snackbarMessage, snackbarErrorMessage, snackbarWarningMessage]);
  useEffect(() => {
    setToolbarButtonAction(null);
  }, [setToolbarButtonAction]);
  useEffect(() => {
    fetchStudentById(id);
  }, []);
  useEffect(() => {
    if (student) {
      // Actualizar el estado isActive con el valor del estudiante
      setIsActive(student.active !== undefined ? student.active : true);
      
      // Filtrar solo el enrollment activo
      const activeEnrollment = student.enrollments?.find(
        (e) => e.status === "active"
      );
      setEnrollments(activeEnrollment ? [activeEnrollment] : []);
    }
  }, [student]);
  return (
    <Box sx={{ p: 1 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h5" component="h1" gutterBottom>
              {formatDate(new Date())} - {student?.first_name}{" "}
              {student?.last_name}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {student?.company_name}
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={isActive}
                onChange={handleActiveChange}
                color={isActive ? "success" : "error"}
              />
            }
            label={isActive ? "Activo" : "Inactivo"}
          />
        </Box>

        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Porcentaje de asistencia:
            </Typography>
            <Typography variant="h6" component="span">
              {
                student?.enrollments?.find((e) => e.status === "active")
                  ?.attendance
              }
              %
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={2}
            justifyContent={{ xs: "flex-start", md: "flex-end" }}
          >
            <Button
              variant="outlined"
              startIcon={<FileDownloadOutlined />}
              onClick={handleExportExcel}
            >
              EXPORTAR EXCEL
            </Button>

            <Button variant="contained" onClick={handleAddRecord}>
              NUEVO
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        <DataGrid
          rows={enrollments}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
        />
      </Paper>
    </Box>
  );
}
