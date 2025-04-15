"use client";
import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Button,
  useMediaQuery,
  Modal,
  Box,
  Stack,
  IconButton,
  Chip,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import EditIcon from "@mui/icons-material/Edit";
import { DataGrid } from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import MyForm from "@/components/Form";
import { useDashboard } from "@/contexts/dashboard";
import { useSchedule } from "@/contexts/schedules";
import { useGroup } from "@/contexts/groups";

const daysOfWeek = [
  { id: 0, label: "Domingo" },
  { id: 1, label: "Lunes" },
  { id: 2, label: "Martes" },
  { id: 3, label: "Miércoles" },
  { id: 4, label: "Jueves" },
  { id: 5, label: "Viernes" },
  { id: 6, label: "Sábado" },
];

const formatDays = (days) => {
  if (!days || !Array.isArray(days)) return "";
  return days
    .map((day) => {
      const dayName = daysOfWeek.find((d) => d.id === day.dayOfWeek)?.label;
      return `${dayName}: ${day.startTime} (${day.duration} min)`;
    })
    .join(", ");
};

export default function Page() {
  const theme = createTheme(esES);
  const isMobile = useMediaQuery("(max-width:600px)");
  const {
    setToolbarButtonAction,
    snackbarMessage,
    snackbarErrorMessage,
    setOpenSnackbar,
  } = useDashboard();

  const { groups, fetchGroups } = useGroup();
  const {
    schedules,
    createSchedule,
    updateSchedule,
    fetchSchedules,
    formErrors,
    scheduleCreated,
  } = useSchedule();

  const [showForm, setShowForm] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [days, setDays] = useState([
    { dayOfWeek: "", startTime: "", duration: 60 },
  ]);

  function handleShowForm() {
    setShowForm(true);
    setIsEditing(false);
    setDays([{ dayOfWeek: "", startTime: "", duration: 60 }]);
    setSelectedGroup(null);
  }

  const handleEdit = (schedule) => {
    setSelectedGroup(schedule.groupId);
    setDays(schedule.days);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleAddDay = () => {
    setDays([...days, { dayOfWeek: "", startTime: "", duration: 60 }]);
  };

  const handleRemoveDay = (index) => {
    const newDays = days.filter((_, i) => i !== index);
    setDays(newDays);
  };

  const handleDayChange = (index, field, value) => {
    const newDays = [...days];
    newDays[index] = {
      ...newDays[index],
      [field]:
        field === "dayOfWeek" || field === "duration" ? Number(value) : value,
    };
    setDays(newDays);
  };

  const handleSubmit = async () => {
    if (!selectedGroup) {
      return;
    }

    const scheduleData = { days };
    try {
      if (isEditing) {
        await updateSchedule(selectedGroup, scheduleData);
      } else {
        await createSchedule(selectedGroup, scheduleData);
      }

      if (!formErrors || Object.keys(formErrors).length === 0) {
        setShowForm(false);
        setDays([{ dayOfWeek: "", startTime: "", duration: 60 }]);
        setSelectedGroup(null);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error al gestionar el cronograma:", error);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "group",
      headerName: "Grupo",
      flex: 1,
      valueGetter: (params) => params.row.group?.name || "N/A",
    },
    {
      field: "teacher",
      headerName: "Docente",
      flex: 1,
      valueGetter: (params) => {
        const teacher = params.row.group?.teacher;
        return teacher ? `${teacher.firstName} ${teacher.lastName}` : "N/A";
      },
    },
    {
      field: "language",
      headerName: "Idioma",
      flex: 1,
      valueGetter: (params) => params.row.group?.language?.name || "N/A",
    },
    {
      field: "module",
      headerName: "Módulo",
      flex: 1,
      valueGetter: (params) => params.row.group?.module?.name || "N/A",
    },
    {
      field: "days",
      headerName: "Horarios",
      flex: 2,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {params.row.days.map((day, index) => (
            <Chip
              key={index}
              label={`${daysOfWeek.find((d) => d.id === day.dayOfWeek)?.label}: ${day.startTime} (${day.duration} min)`}
              size="small"
            />
          ))}
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Acciones",
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          startIcon={<EditIcon />}
          onClick={() => handleEdit(params.row)}
        >
          Editar
        </Button>
      ),
    },
  ];

  useEffect(() => {
    setToolbarButtonAction({
      label: "Crear nuevo",
      action: handleShowForm,
      icon: <CalendarMonthIcon />,
    });
  }, [setToolbarButtonAction]);

  useEffect(() => {
    if (snackbarMessage || snackbarErrorMessage) {
      setOpenSnackbar(true);
    }
  }, [snackbarMessage, snackbarErrorMessage]);

  useEffect(() => {
    fetchSchedules();
    fetchGroups();
  }, [scheduleCreated]);

  return (
    <>
      <ThemeProvider theme={theme}>
        <DataGrid
          columns={columns}
          rows={schedules || []}
          getRowId={(row) => row.id}
          sx={{
            width: "100%",
            "& .MuiDataGrid-cell": {
              py: 2,
            },
          }}
        />
      </ThemeProvider>

      <Modal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setDays([{ dayOfWeek: "", startTime: "", duration: 60 }]);
          setIsEditing(false);
        }}
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
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            overflowY: "auto",
          }}
        >
          <Typography variant="h4">
            {isEditing ? "Editar Cronograma" : "Crear Cronograma"}
          </Typography>

          {!isEditing && (
            <Box sx={{ mb: 2 }}>
              <MyForm
                fields={[
                  {
                    name: "groupId",
                    label: "Grupo",
                    component: "select",
                    options: groups
                      ?.filter(
                        (group) =>
                          !schedules.find((s) => s.groupId === group.id)
                      )
                      .map((group) => ({
                        id: group.id,
                        label: `${group.name} - ${group.teacher.firstName} ${group.teacher.lastName}`,
                      })),
                    required: true,
                  },
                ]}
                values={{ groupId: selectedGroup }}
                onChange={(field, value) => setSelectedGroup(value)}
                errors={formErrors}
              />
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }}>
            {days.map((day, index) => (
              <Stack key={index} spacing={2} sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6">Día {index + 1}</Typography>
                  {index > 0 && (
                    <IconButton
                      onClick={() => handleRemoveDay(index)}
                      color="error"
                    >
                      <RemoveIcon />
                    </IconButton>
                  )}
                </Box>

                <MyForm
                  fields={[
                    {
                      name: `dayOfWeek`,
                      label: "Día de la semana",
                      component: "select",
                      options: daysOfWeek,
                      required: true,
                    },
                    {
                      name: `startTime`,
                      label: "Hora de inicio (HH:MM)",
                      required: true,
                    },
                    {
                      name: `duration`,
                      label: "Duración (minutos)",
                      type: "number",
                      required: true,
                    },
                  ]}
                  values={day}
                  onChange={(field, value) =>
                    handleDayChange(index, field, value)
                  }
                  errors={formErrors}
                />
              </Stack>
            ))}

            <Button
              startIcon={<AddIcon />}
              onClick={handleAddDay}
              variant="outlined"
              fullWidth
              sx={{ mt: 2 }}
            >
              Agregar otro día
            </Button>
          </Box>

          <Box sx={{ mt: "auto" }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              fullWidth
              disabled={!selectedGroup}
            >
              {isEditing ? "Guardar cambios" : "Crear cronograma"}
            </Button>
          </Box>
        </Paper>
      </Modal>
    </>
  );
}
