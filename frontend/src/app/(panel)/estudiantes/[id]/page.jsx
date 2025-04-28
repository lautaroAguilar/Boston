"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Box, Paper, Typography, Divider, Stack, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { FileDownloadOutlined } from "@mui/icons-material";
import { useStudent } from "@/contexts/students";
import { useDashboard } from "@/contexts/dashboard";
import { formatDate } from "@/utils/dateUtils";

export default function StudentDetail() {
  const { id } = useParams();
  const { fetchStudentById, student } = useStudent();
  const {
    snackbarErrorMessage,
    snackbarMessage,
    snackbarWarningMessage,
    setOpenSnackbar,
    setToolbarButtonAction,
  } = useDashboard();
  const [attendanceRate, setAttendanceRate] = useState(80);

  const handleExportExcel = () => {
    console.log("Exportando a Excel...");
    // Implementar lógica de exportación
  };

  const handleAddRecord = () => {
    console.log("Agregando nuevo registro...");
    // Implementar lógica para agregar un nuevo registro
  };
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
  return (
    <Box sx={{ p: 1 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box>
          <Typography variant="h5" component="h1" gutterBottom>
            {formatDate(new Date())} - {student?.first_name}{" "}
            {student?.last_name}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {student?.company_name}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Porcentaje de asistencia:
            </Typography>
            <Typography variant="h6" component="span">
              {attendanceRate}%
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
          rows={[]}
          columns={[]}
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
