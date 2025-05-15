"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSchedule } from "@/contexts/schedules";
import { useDashboard } from "@/contexts/dashboard";
import { useGroup } from "@/contexts/groups";
import {
  Box,
  Paper,
  Typography,
  Divider,
  Stack,
  Button,
  Chip,
  Modal,
  TextField,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  MenuItem,
  Select,
  InputLabel,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { FileDownloadOutlined, Add } from "@mui/icons-material";
import { formatDate, formatTime } from "@/utils/dateUtils";
import OptionsButton from "@/components/OptionsButton";

const daysOfWeek = [
  { id: 0, label: "Domingo" },
  { id: 1, label: "Lunes" },
  { id: 2, label: "Martes" },
  { id: 3, label: "Miércoles" },
  { id: 4, label: "Jueves" },
  { id: 5, label: "Viernes" },
  { id: 6, label: "Sábado" },
];

// Opciones para el tiempo asistido
const tiempoOptions = [
  { value: 15, label: "15 minutos" },
  { value: 30, label: "30 minutos" },
  { value: 45, label: "45 minutos" },
  { value: 60, label: "60 minutos" },
  { value: 75, label: "75 minutos" },
  { value: 90, label: "90 minutos" },
  { value: 105, label: "105 minutos" },
  { value: 120, label: "120 minutos" },
];
const asistenciaOptions = [
  { value: "P", label: "Present" },
  { value: "WN", label: "Without notice" },
  { value: "IA", label: "In advance" },
  { value: "BT", label: "Business trip" },
  { value: "SV", label: "Student vacation" },
  { value: "NH", label: "National holiday" },
];

export default function ScheduleDetail() {
  const params = useParams();
  const groupId = params.id;
  const theme = createTheme(esES);

  const { getScheduleByGroupId, fetchClassesByGroupId, classesByGroupId } =
    useSchedule();
  const { fetchGroupById } = useGroup();
  const {
    snackbarErrorMessage,
    snackbarMessage,
    setOpenSnackbar,
    setToolbarButtonAction,
  } = useDashboard();

  const [schedule, setSchedule] = useState(null);
  const [group, setGroup] = useState(null);
  const [openObservationModal, setOpenObservationModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [informationForm, setInformationForm] = useState({
    teacherAttendance: false,
    activities: "",
    observations: "",
    content: "",
    attendances: [],
  });

  const handleExportExcel = () => {
    console.log("Exportando a Excel...");
    // Implementar lógica de exportación
  };

  const handleAddClass = () => {
    console.log("Agregando nueva clase...");
    // Implementar lógica para agregar una nueva clase
  };

  const handleObservationChange = (field, value) => {
    setInformationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Actualiza la asistencia del docente
  const handleTeacherAttendanceChange = (value) => {
    setInformationForm(prev => ({
      ...prev,
      teacherAttendance: value === 'true'
    }));
  };

  // Actualiza la asistencia de un estudiante
  const handleStudentAttendanceChange = (studentId, field, value) => {
    setInformationForm(prev => {
      const newAttendances = [...prev.attendances];
      const studentIndex = newAttendances.findIndex(a => a.studentId === studentId);
      
      if (studentIndex !== -1) {
        if (field === 'status') {
          // Actualiza el estado de asistencia
          const isPresent = value === "P";
          newAttendances[studentIndex] = {
            ...newAttendances[studentIndex],
            status: value,
            // Si no está presente, reinicia el tiempo a 0
            timeAttendance: isPresent ? newAttendances[studentIndex].timeAttendance : 0
          };
        } else if (field === 'timeAttended') {
          // Actualiza el tiempo de asistencia
          newAttendances[studentIndex] = {
            ...newAttendances[studentIndex],
            timeAttendance: parseInt(value)
          };
        }
      }
      
      return {
        ...prev,
        attendances: newAttendances
      };
    });
  };

  // Inicializa los datos de asistencia al abrir el modal
  const initializeAttendanceData = (students) => {
    if (!students || students.length === 0) return [];
    
    // Crea un array de asistencias con la estructura requerida por el endpoint
    const initialAttendances = students.map(student => ({
      studentId: student.student.id,
      status: "WN", // por defecto ausente
      timeAttendance: 0  // por defecto 0 minutos
    }));
    
    setInformationForm(prev => ({
      ...prev,
      attendances: initialAttendances
    }));
  };

  // Prepara el formulario al abrir el modal
  const handleOpenModal = (classData) => {
    setSelectedClass(classData);
    
    // Reinicia el formulario
    setInformationForm({
      teacherAttendance: false,
      activities: "",
      observations: "",
      content: "",
      attendances: []
    });
    
    // Inicializa los datos de asistencia si hay estudiantes
    if (classData?.group?.students) {
      initializeAttendanceData(classData.group.students);
    }
    
    setOpenObservationModal(true);
  };

  const handleSaveObservation = async () => {
    // Aquí preparamos los datos para enviar al servidor
    const dataToSend = {
      classId: selectedClass?.id,
      teacherAttendance: informationForm.teacherAttendance,
      activities: informationForm.activities,
      observations: informationForm.observations,
      content: informationForm.content,
      attendances: informationForm.attendances
    };
    
    console.log("Guardando información:", dataToSend);
    
    try {
      // Aquí iría la llamada a la API para guardar la información
      // const response = await fetch(`${CONFIG.API_URL}/class/attendance`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   credentials: 'include',
      //   body: JSON.stringify(dataToSend)
      // });
      
      // if (!response.ok) throw new Error('Error al guardar la información');
      
      // Implementar manejo de éxito
      // setSnackbarMessage('Información guardada correctamente');
      
      // Cerrar el modal
      setOpenObservationModal(false);
    } catch (error) {
      console.error('Error al guardar la información:', error);
      // setSnackbarErrorMessage('Error al guardar la información');
    }
  };

  const columns = [
    {
      field: "date",
      headerName: "Fecha",
      flex: 1,
      renderCell: (params) => formatDate(params.value),
    },
    {
      field: "students",
      headerName: "Alumnos",
      flex: 1,
      renderCell: (params) => {
        const students = params.row.group.students || [];
        return students
          .map((s) => `${s.student.first_name} ${s.student.last_name}`)
          .join(", ");
      },
    },
    {
      field: "duration",
      headerName: "Duración",
      flex: 1,
      renderCell: (params) => `${params.value} hs`,
    },
    {
      field: "startTime",
      headerName: "Inicio",
      flex: 1,
      renderCell: (params) => formatTime(params.value),
    },
    {
      field: "actions",
      headerName: "",
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const handleAddObservation = () => {
          handleOpenModal(params.row);
        };
        const options = [
          {
            label: "Agregar observación",
            onClick: handleAddObservation,
          },
        ];
        return <OptionsButton options={options} row={params.row} />;
      },
    },
  ];

  useEffect(() => {
    if (snackbarMessage || snackbarErrorMessage) {
      setOpenSnackbar(true);
    }
  }, [snackbarMessage, snackbarErrorMessage]);

  useEffect(() => {
    setToolbarButtonAction(null);
  }, [setToolbarButtonAction]);

  useEffect(() => {
    const loadScheduleData = async () => {
      if (groupId) {
        const scheduleData = await getScheduleByGroupId(groupId);
        setSchedule(scheduleData);

        const groupData = await fetchGroupById(groupId);
        setGroup(groupData);

        await fetchClassesByGroupId(groupId);
      }
    };

    loadScheduleData();
  }, [groupId]);

  // Obtener estudiantes de la clase seleccionada
  const getStudentsFromSelectedClass = () => {
    if (!selectedClass || !selectedClass.group || !selectedClass.group.students) {
      return [];
    }
    return selectedClass.group.students;
  };

  // Verificar si un estudiante está marcado como presente
  const isStudentPresent = (studentId) => {
    const studentAttendance = informationForm.attendances.find(a => a.studentId === studentId);
    return studentAttendance && studentAttendance.status === "P";
  };

  // Obtener el tiempo de asistencia de un estudiante
  const getStudentAttendanceTime = (studentId) => {
    const studentAttendance = informationForm.attendances.find(a => a.studentId === studentId);
    return studentAttendance ? studentAttendance.timeAttendance : 0;
  };

  // Obtener el estado de asistencia de un estudiante
  const getStudentAttendanceStatus = (studentId) => {
    const studentAttendance = informationForm.attendances.find(a => a.studentId === studentId);
    return studentAttendance ? studentAttendance.status : "WN";
  };

  return (
    <Box sx={{ p: 1 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box>
          <Typography variant="h5" component="h1" gutterBottom>
            Cronograma de clase {group ? `(${group.name})` : ""}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Docente:
            </Typography>
            <Typography variant="body1">
              {group?.teacher
                ? `${group.teacher.firstName} ${group.teacher.lastName}`
                : "Sin docente asignado"}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Idioma:
            </Typography>
            <Typography variant="body1">
              {group?.language?.name || "No especificado"}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Nivel:
            </Typography>
            <Typography variant="body1">
              {group?.module?.name || "No especificado"}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Días:
            </Typography>
            <Stack direction="row" spacing={1}>
              {schedule?.days?.map((day, index) => (
                <Chip
                  key={index}
                  label={daysOfWeek.find((d) => d.id === day.dayOfWeek)?.label}
                  size="small"
                />
              ))}
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Stack
          direction="row"
          spacing={2}
          justifyContent="flex-end"
          sx={{ mb: 2 }}
        >
          <Button
            variant="outlined"
            startIcon={<FileDownloadOutlined />}
            onClick={handleExportExcel}
          >
            EXPORTAR EXCEL
          </Button>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddClass}
          >
            NUEVA CLASE
          </Button>
        </Stack>

        <ThemeProvider theme={theme}>
          <DataGrid
            rows={classesByGroupId || []}
            columns={columns}
            getRowId={(row) => row.id}
            getRowHeight={() => "auto"}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            pageSizeOptions={[10, 25, 50]}
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
      </Paper>
      
      <Modal
        open={openObservationModal}
        onClose={() => setOpenObservationModal(false)}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            maxHeight: "90vh",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            overflow: "auto",
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Agregar información
          </Typography>

          {/* Asistencia del docente */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              {group?.teacher ? `${group.teacher.firstName} ${group.teacher.lastName}` : "docente"}
            </Typography>
            
            <RadioGroup
              row
              value={informationForm.teacherAttendance.toString()}
              onChange={(e) => handleTeacherAttendanceChange(e.target.value)}
            >
              <FormControlLabel value="true" control={<Radio />} label="Asistió" />
              <FormControlLabel value="false" control={<Radio />} label="No asistió" />
            </RadioGroup>
            
            <Divider sx={{ my: 2 }} />
          </Box>
          
          {/* Asistencia de los alumnos */}
          {getStudentsFromSelectedClass().map((studentItem, index) => {
            const student = studentItem.student;
            return (
              <Box key={student.id} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {student.first_name} {student.last_name}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Asistencia
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={getStudentAttendanceStatus(student.id)}
                      onChange={(e) => handleStudentAttendanceChange(student.id, 'status', e.target.value)}
                      displayEmpty
                    >
                      {asistenciaOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Tiempo asistido (minutos)
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={getStudentAttendanceTime(student.id) || ''}
                      onChange={(e) => handleStudentAttendanceChange(student.id, 'timeAttended', e.target.value)}
                      disabled={getStudentAttendanceStatus(student.id) !== "P"}
                      displayEmpty
                    >
                      <MenuItem value="" disabled>Seleccionar tiempo</MenuItem>
                      {tiempoOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                
                <Divider sx={{ my: 2 }} />
              </Box>
            );
          })}
          
          {/* Actividades */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Actividades
            </Typography>
            <TextField
              multiline
              rows={4}
              fullWidth
              placeholder="Lorem ipsum dolor sit amet consectetur adipiscing elit posuere, nec condimentum enim phasellus praesent interdum ad, nullam mi taciti urna scelerisque nascetur lacus."
              value={informationForm.activities}
              onChange={(e) => handleObservationChange('activities', e.target.value)}
            />
          </Box>
          
          {/* Observaciones */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Observaciones
            </Typography>
            <TextField
              fullWidth
              placeholder="Agregar observación"
              value={informationForm.observations}
              onChange={(e) => handleObservationChange('observations', e.target.value)}
            />
          </Box>
          
          {/* Contenido */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Contenido
            </Typography>
            <TextField
              fullWidth
              placeholder="Agregar contenido"
              value={informationForm.content}
              onChange={(e) => handleObservationChange('content', e.target.value)}
            />
          </Box>
          
          {/* Botón de guardar */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              onClick={handleSaveObservation}
              sx={{ px: 4 }}
            >
              GUARDAR
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
