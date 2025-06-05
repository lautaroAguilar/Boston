"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  Divider,
  Stack,
  Button,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { FileDownloadOutlined, Edit as EditIcon } from "@mui/icons-material";
import { useStudent } from "@/contexts/students";
import { useDashboard } from "@/contexts/dashboard";
import { formatDate } from "@/utils/dateUtils";
import EditModal from "@/components/EditModal";
import { useExcelExport } from "@/hooks/useExcelExport";
import ExportProgressDialog from "@/components/ExportProgressDialog";

export default function StudentDetail() {
  const { id } = useParams();
  const { fetchStudentById, student, updateStudent } = useStudent();
  const {
    snackbarErrorMessage,
    snackbarMessage,
    snackbarWarningMessage,
    setOpenSnackbar,
    setToolbarButtonAction,
    setToolbarExportAction,
  } = useDashboard();
  const { exportDataGridToExcel, isExporting, exportProgress } =
    useExcelExport();
  const [enrollments, setEnrollments] = useState([]);
  const [isActive, setIsActive] = useState(true);

  // Modal de edición
  const [openEditDialog, setOpenEditDialog] = useState(false);

  // Estado local para manejar los cambios visuales de los certificados
  const [certificateStates, setCertificateStates] = useState({});

  const handleCertificateChange = (enrollmentId, newValue) => {
    setCertificateStates((prev) => ({
      ...prev,
      [enrollmentId]: newValue,
    }));
  };

  const handleExportToExcel = async () => {
    await exportDataGridToExcel(enrollments, columns, "Estudiantes");
  };

  // Configuración del modal de edición
  const studentModalConfig = {
    title: "Editar Perfil",
    fields: [
      { name: "active", label: "Estado del estudiante", type: "switch" },
      { name: "first_name", label: "Nombre" },
      { name: "last_name", label: "Apellido" },
      { name: "email", label: "Email", type: "email" },
      { name: "sid", label: "SID" },
    ],
    onSubmit: (data) => {
      updateStudent(id, data);
      setIsActive(data.active);
      setOpenEditDialog(false);
    },
  };

  // Valores actualizados para el modal
  const studentModalValues = {
    active: isActive,
    first_name: student?.first_name || "",
    last_name: student?.last_name || "",
    email: student?.email || "",
    sid: student?.sid || "",
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
                onChange={(e) =>
                  handleCertificateChange(params.row.id, e.target.checked)
                }
                color="primary"
              />
            }
            label={isChecked ? "Sí" : "No"}
          />
        );
      },
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
    setToolbarExportAction(null);
  }, [setToolbarButtonAction, setToolbarExportAction]);
  useEffect(() => {
    fetchStudentById(id);
  }, []);
  useEffect(() => {
    if (student) {
      // Actualizar el estado isActive con el valor del estudiante
      setIsActive(student.active !== undefined ? student.active : true);

      // Filtrar solo el enrollment activo. TAL VEZ HAY QUE CAMBIAR ESTO PARA MOSTRAR TODOS LOS ENROLLMENTS
      const activeEnrollment = student.enrollments?.find(
        (e) => e.status === "active"
      );
      setEnrollments(activeEnrollment ? [activeEnrollment] : []);
    }
  }, [student]);
  return (
    <Box sx={{ p: 1 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h5" component="h1" gutterBottom>
              {student?.last_name} {student?.first_name}
              {student?.active ? " - Activo" : " - Inactivo"}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {student?.company_name}
            </Typography>
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
          </Box>
          <Box>
            <Stack
              direction="row"
              spacing={2}
              justifyContent={{ xs: "flex-start", md: "flex-end" }}
            >
             {/*  <Button
                variant="outlined"
                startIcon={<FileDownloadOutlined />}
                onClick={handleExportToExcel}
              >
                EXPORTAR EXCEL
              </Button> */}
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setOpenEditDialog(true)}
              >
                EDITAR PERFIL
              </Button>
            </Stack>
          </Box>
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

      {/* Modal de edición de perfil */}
      <EditModal
        isOpen={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        title={studentModalConfig.title}
        fields={studentModalConfig.fields}
        values={studentModalValues}
        onSubmit={studentModalConfig.onSubmit}
      />
      <ExportProgressDialog 
        open={isExporting}
        progress={exportProgress}
        isExporting={isExporting}
        onClose={() => {}}
      />
    </Box>
  );
}
