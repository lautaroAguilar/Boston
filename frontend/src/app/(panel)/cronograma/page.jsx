"use client";
import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Button,
  useMediaQuery,
  Modal,
  Box,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Chip,
  TextField,
  FormControl,
  FormLabel,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { DataGrid } from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import { createTheme, ThemeProvider } from "@mui/material/styles";
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

export default function Page() {
  const theme = createTheme(esES);
  const isMobile = useMediaQuery("(max-width:600px)");
  const {
    setToolbarButtonAction,
    snackbarMessage,
    snackbarErrorMessage,
    setOpenSnackbar,
    selectedCompany,
  } = useDashboard();

  const { groups, fetchGroups } = useGroup();
  const {
    schedules,
    classes,
    createSchedule,
    fetchClassesByDateAndCompany,
    formErrors,
    scheduleCreated,
    setFormErrors,
  } = useSchedule();

  const [showForm, setShowForm] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [formValues, setFormValues] = useState({
    startDate: "",
    endDate: "",
    startTime: "",
    duration: 60,
    weekDays: [],
  });

  function handleShowForm() {
    setShowForm(true);
    setFormErrors({});
    setFormValues({
      startDate: "",
      endDate: "",
      startTime: "",
      duration: 60,
      weekDays: [],
    });
  }

  const handleCloseForm = () => {
    setShowForm(false);
    setFormErrors({});
    setFormValues({
      startDate: "",
      endDate: "",
      startTime: "",
      duration: 60,
      weekDays: [],
    });
    setSelectedGroup(null);
  };

  const handleFormChange = (field, value) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleWeekDayToggle = (dayId) => {
    setFormValues((prev) => ({
      ...prev,
      weekDays: prev.weekDays.includes(dayId)
        ? prev.weekDays.filter((d) => d !== dayId)
        : [...prev.weekDays, dayId],
    }));
  };

  const handleSubmit = async () => {
    console.log(selectedGroup, formValues);
    if (!selectedGroup) {
      setFormErrors({ groupId: "Debe seleccionar un grupo" });
      return;
    }

    try {
      await createSchedule(selectedGroup, formValues);
      handleCloseForm();
    } catch (error) {
      console.error("Error al crear el cronograma:", error);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    {
      field: "group",
      headerName: "Grupo",
      flex: 1,
      renderCell: (params) => params.row.group?.name || "N/A",
    },
    {
      field: "teacher",
      headerName: "Docente",
      flex: 1,
      renderCell: (params) =>
        params.row.teacher?.firstName + " " + params.row.teacher?.lastName ||
        "N/A",
    },
    {
      field: "date",
      headerName: "Fecha",
      flex: 1,
    },
    {
      field: "startTime",
      headerName: "Horario de inicio",
      flex: 1,
    },
    {
      field: "duration",
      headerName: "Duracion (horas)",
      flex: 1,
    },
    /* {
      field: "days",
      headerName: "Días",
      flex: 2,
    }, */
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
    fetchClassesByDateAndCompany("2025-05-15", selectedCompany);
  }, [scheduleCreated, selectedCompany]);
  useEffect(() => {
    fetchGroups();
  }, []);
  return (
    <>
      <ThemeProvider theme={theme}>
        <DataGrid
          columns={columns}
          rows={classes || []}
          getRowId={(row) => row.id}
          sx={{
            width: "100%",
            "& .MuiDataGrid-cell": {
              py: 2,
            },
          }}
        />
      </ThemeProvider>

      <Modal open={showForm} onClose={handleCloseForm} sx={{ height: "100%" }}>
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
            overflowY: "auto",
            scrollbarWidth: "thin",
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Nuevo Cronograma
          </Typography>

          <Box
            component="form"
            noValidate
            sx={{
              height: "auto",
              width: "100%",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <FormControl fullWidth error={!!formErrors.groupId} margin="normal">
              <InputLabel>Grupo</InputLabel>
              <Select
                value={selectedGroup || ""}
                onChange={(e) => setSelectedGroup(e.target.value)}
                label="Grupo"
              >
                {groups
                  ?.filter(
                    (group) => !schedules.find((s) => s.groupId === group.id)
                  )
                  .map((group) => (
                    <MenuItem key={group.id} value={group.id}>
                      {group.name} - {group.teacher.firstName}{" "}
                      {group.teacher.lastName}
                    </MenuItem>
                  ))}
              </Select>
              {formErrors.groupId && (
                <FormHelperText>{formErrors.groupId}</FormHelperText>
              )}
            </FormControl>

            <TextField
              fullWidth
              type="date"
              label="Fecha de inicio"
              value={formValues.startDate}
              onChange={(e) => handleFormChange("startDate", e.target.value)}
              error={!!formErrors.startDate}
              helperText={formErrors.startDate}
              InputLabelProps={{ shrink: true }}
              margin="normal"
            />

            <TextField
              fullWidth
              type="date"
              label="Fecha de fin"
              value={formValues.endDate}
              onChange={(e) => handleFormChange("endDate", e.target.value)}
              error={!!formErrors.endDate}
              helperText={formErrors.endDate}
              InputLabelProps={{ shrink: true }}
              margin="normal"
            />

            <TextField
              fullWidth
              label="Horario de clases"
              value={formValues.startTime}
              onChange={(e) => handleFormChange("startTime", e.target.value)}
              error={!!formErrors.startTime}
              helperText={
                formErrors.startTime || "Formato: HH:MM (ejemplo: 09:00)"
              }
              placeholder="09:00"
              margin="normal"
            />

            <TextField
              fullWidth
              type="number"
              label="Duración (minutos)"
              value={formValues.duration}
              onChange={(e) =>
                handleFormChange("duration", parseInt(e.target.value))
              }
              error={!!formErrors.duration}
              helperText={formErrors.duration || "Entre 30 y 240 minutos"}
              inputProps={{ min: 30, max: 240 }}
              margin="normal"
            />

            <FormControl
              fullWidth
              error={!!formErrors.weekDays}
              margin="normal"
            >
              <FormLabel component="legend">Días de la semana</FormLabel>
              <FormGroup row>
                {daysOfWeek.map((day) => (
                  <FormControlLabel
                    key={day.id}
                    control={
                      <Checkbox
                        checked={formValues.weekDays.includes(day.id)}
                        onChange={() => handleWeekDayToggle(day.id)}
                      />
                    }
                    label={day.label}
                  />
                ))}
              </FormGroup>
              {formErrors.weekDays && (
                <FormHelperText>{formErrors.weekDays}</FormHelperText>
              )}
            </FormControl>

            <Box
              sx={{
                mt: 3,
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
              }}
            >
              <Button onClick={handleCloseForm} color="inherit">
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                color="primary"
              >
                Crear
              </Button>
            </Box>
          </Box>
        </Paper>
      </Modal>
    </>
  );
}
