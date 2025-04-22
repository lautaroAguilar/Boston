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
  Tabs,
  Tab,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { DataGrid } from "@mui/x-data-grid";
import { esES } from "@mui/x-data-grid/locales";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useDashboard } from "@/contexts/dashboard";
import { useSchedule } from "@/contexts/schedules";
import { useGroup } from "@/contexts/groups";
import {
  formatDate,
  formatTime,
  formatDuration,
  formatDateForAPI,
} from "@/utils/dateUtils";
import moment from "moment";
import "moment/locale/es";
import { DatePicker } from "@mui/x-date-pickers";
import LocalizationWrapper from "@/components/LocalizationWrapper";

// Configurar momento para usar español
moment.locale("es");

const daysOfWeek = [
  { id: 0, label: "Domingo" },
  { id: 1, label: "Lunes" },
  { id: 2, label: "Martes" },
  { id: 3, label: "Miércoles" },
  { id: 4, label: "Jueves" },
  { id: 5, label: "Viernes" },
  { id: 6, label: "Sábado" },
];

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      style={{ width: "100%" }}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

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
    fetchSchedules,
    formErrors,
    scheduleCreated,
    setFormErrors,
  } = useSchedule();

  const [showForm, setShowForm] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [formValues, setFormValues] = useState({
    startDate: "",
    endDate: "",
    startTime: "",
    duration: 60,
    weekDays: [],
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

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

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  // Columnas para la pestaña de cronogramas
  const scheduleColumns = [
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
        params.row.group.teacher?.firstName +
          " " +
          params.row.group.teacher?.lastName || "N/A",
    },
    {
      field: "startDate",
      headerName: "Inicio",
      flex: 1,
      valueFormatter: (params) => formatDate(params),
    },
    {
      field: "endDate",
      headerName: "Fin",
      flex: 1,
      valueFormatter: (params) => formatDate(params),
    },
    {
      field: "days",
      headerName: "Días",
      flex: 2,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {params.value.map((day, index) => (
            <Chip
              key={index}
              label={daysOfWeek.find((d) => d.id === day.dayOfWeek)?.label}
              size="small"
            />
          ))}
        </Box>
      ),
    },
  ];

  // Columnas para la pestaña de clases
  const classesColumns = [
    {
      field: "group",
      headerName: "Grupo",
      flex: 1,
      renderCell: (params) => params.row.group?.name || "N/A",
    },
    {
      field: "idioma",
      headerName: "Idioma",
      flex: 1,
      renderCell: (params) => params.row.group?.language?.name || "N/A",
    },
    {
      field: "level",
      headerName: "Nivel",
      flex: 1,
      renderCell: (params) => params.row.group?.module?.name || "N/A",
    },
    {
      field: "docente",
      headerName: "Docente",
      flex: 1,
      renderCell: (params) => {
        const teacher = params.row.teacher;
        return teacher ? `${teacher.firstName} ${teacher.lastName}` : "N/A";
      },
    },
    {
      field: "studentsCount",
      headerName: "Cant. Alumnos",
      width: 120,
      renderCell: (params) => params.row.group?.students?.length || 0,
    },
    {
      field: "duration",
      headerName: "Duración",
      width: 100,
      valueFormatter: (params) => formatDuration(params),
    },
    {
      field: "startTime",
      headerName: "Inicio",
      width: 120,
      valueFormatter: (params) => formatTime(params),
    },
    {
      field: "date",
      headerName: "Fecha",
      flex: 1,
      valueFormatter: (params) => formatDate(params),
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
    if (selectedCompany) {
      const formattedDate = formatDateForAPI(selectedDate);
      fetchClassesByDateAndCompany(formattedDate, selectedCompany);
    }
  }, [selectedDate, selectedCompany, scheduleCreated]);

  useEffect(() => {
    fetchSchedules();
    fetchGroups();
  }, []);

  return (
    <>
      <Box sx={{ width: "100%", mb: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="cronogramas tabs"
          >
            <Tab label="Clases del día" />
            <Tab label="Cronogramas" />
          </Tabs>
        </Box>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box
          sx={{
            mb: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Typography variant="h6">
            Cronograma de clases {formatDate(selectedDate)}
          </Typography>
          <LocalizationWrapper>
            <DatePicker
              label="Seleccionar fecha"
              value={selectedDate}
              onChange={handleDateChange}
              format="DD/MM/YYYY"
              slotProps={{ textField: { size: "small" } }}
            />
          </LocalizationWrapper>
        </Box>

        {selectedCompany ? (
          classes && classes.length > 0 ? (
            <ThemeProvider theme={theme}>
              <DataGrid
                columns={classesColumns}
                rows={classes}
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
                pageSizeOptions={[5, 10, 25]}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 10, page: 0 },
                  },
                }}
              />
            </ThemeProvider>
          ) : (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ textAlign: "center", my: 4 }}
            >
              No hay clases programadas para esta fecha
            </Typography>
          )
        ) : (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ textAlign: "center", my: 4 }}
          >
            Seleccione una empresa para ver las clases
          </Typography>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <ThemeProvider theme={theme}>
          <DataGrid
            columns={scheduleColumns}
            rows={schedules || []}
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
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 },
              },
            }}
          />
        </ThemeProvider>
      </TabPanel>

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
