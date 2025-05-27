import React, { createContext, useContext, useState } from "react";
import CONFIG from "../../config/api";
import { useDashboard } from "./dashboard";
import { useAuth } from "./auth";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
const ScheduleContext = createContext();

export const ScheduleProvider = ({ children }) => {
  const { refreshToken, logout } = useAuth();
  const { setSnackbarMessage, setSnackbarErrorMessage } = useDashboard();
  const [errorMessage, setErrorMessage] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [scheduleCreated, setScheduleCreated] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classesByGroupId, setClassesByGroupId] = useState([]);
  const [classInfo, setClassInfo] = useState(null);

  async function fetchSchedules(companyId) {
    try {
      let url = `${CONFIG.API_URL}/schedules`;
      if (companyId) {
        url += `?companyId=${companyId}`;
      }

      const res = await fetchWithAuth(
        url,
        {
          method: "GET",
        },
        refreshToken,
        logout
      );

      if (!res.ok) {
        const errorData = await res.json();
        setSnackbarErrorMessage(errorData.message);
        return;
      }

      const data = await res.json();
      setSchedules(data.data);
    } catch (error) {
      setSnackbarErrorMessage("Error al obtener los cronogramas");
      console.error("Error al obtener los cronogramas:", error);
    }
  }
  async function fetchClassesByDateAndCompany(date, companyId) {
    try {
      const res = await fetchWithAuth(
        `${CONFIG.API_URL}/schedules/classes?date=${date}&companyId=${companyId}`,
        {
          method: "GET",
        },
        refreshToken,
        logout
      );

      if (!res.ok) {
        const errorData = await res.json();
        setSnackbarErrorMessage(errorData.message);
        return;
      }

      const data = await res.json();
      setClasses(data.data);
      return data.data;
    } catch (error) {
      setSnackbarErrorMessage("Error al obtener las clases");
      console.error("Error al obtener las clases:", error);
    }
  }
  async function fetchClassesByGroupId(groupId) {
    try {
      const res = await fetchWithAuth(
        `${CONFIG.API_URL}/schedules/classes/${groupId}`,
        {
          method: "GET",
        },
        refreshToken,
        logout
      );

      if (!res.ok) {
        const errorData = await res.json();
        setSnackbarErrorMessage(errorData.message);
        return;
      }

      const data = await res.json();
      setClassesByGroupId(data.data);
      return data.data;
    } catch (error) {
      setSnackbarErrorMessage("Error al obtener las clases");
      console.error("Error al obtener las clases:", error);
    }
  }

  async function getClassById(classId) {
    try {
      const res = await fetchWithAuth(
        `${CONFIG.API_URL}/schedules/classes/info/${classId}`,
        {
          method: "GET",
        },
        refreshToken,
        logout
      );

      if (!res.ok) {
        const errorData = await res.json();
        setSnackbarErrorMessage(errorData.message);
        return null;
      }

      const data = await res.json();
      setClassInfo(data.data);
      return;
    } catch (error) {
      setSnackbarErrorMessage("Error al obtener la información de la clase");
      console.error("Error al obtener la información de la clase:", error);
      return null;
    }
  }

  async function createSchedule(groupId, scheduleData) {
    setFormErrors({});
    setErrorMessage("");
    try {
      const transformedData = {
        startDate: scheduleData.startDate.format("YYYY-MM-DD"),
        endDate: scheduleData.endDate.format("YYYY-MM-DD"),
        days: scheduleData.weekDays.map((dayId) => ({
          dayOfWeek: dayId,
          startTime: scheduleData.startTime,
          duration: scheduleData.duration,
        })),
      };

      const res = await fetchWithAuth(
        `${CONFIG.API_URL}/schedules/${groupId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transformedData),
        },
        refreshToken,
        logout
      );

      if (!res.ok) {
        const errorData = await res.json();
        if (Array.isArray(errorData)) {
          const errorObj = errorData.reduce((acc, issue) => {
            const fieldName = issue.path[0];
            acc[fieldName] = issue.message;
            return acc;
          }, {});
          setFormErrors(errorObj);
          return null;
        } else {
          setSnackbarErrorMessage(errorData.error);
          return null;
        }
      }

      const data = await res.json();
      setSnackbarMessage("Cronograma creado exitosamente");
      setScheduleCreated(true);
      await fetchSchedules();
      return data;
    } catch (error) {
      setSnackbarErrorMessage("Error al crear el cronograma");
      console.error("Error al crear el cronograma:", error);
      return null;
    }
  }

  async function getScheduleByGroupId(groupId) {
    try {
      const res = await fetchWithAuth(
        `${CONFIG.API_URL}/schedules/${groupId}`,
        {
          method: "GET",
        },
        refreshToken,
        logout
      );

      if (!res.ok) {
        const errorData = await res.json();
        setSnackbarErrorMessage(errorData.message);
        return null;
      }

      const data = await res.json();
      return data.data;
    } catch (error) {
      setSnackbarErrorMessage("Error al obtener el cronograma");
      console.error("Error al obtener el cronograma:", error);
      return null;
    }
  }

  async function updateSchedule(groupId, scheduleData) {
    setFormErrors({});
    setErrorMessage("");
    try {
      const transformedData = {
        startDate: scheduleData.startDate,
        endDate: scheduleData.endDate,
        days: scheduleData.weekDays.map((dayId) => ({
          dayOfWeek: dayId,
          startTime: scheduleData.startTime,
          duration: scheduleData.duration,
        })),
      };

      const res = await fetchWithAuth(
        `${CONFIG.API_URL}/schedules/${groupId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transformedData),
        },
        refreshToken,
        logout
      );

      if (!res.ok) {
        const errorData = await res.json();
        if (Array.isArray(errorData)) {
          const errorObj = errorData.reduce((acc, issue) => {
            const fieldName = issue.path[0];
            acc[fieldName] = issue.message;
            return acc;
          }, {});
          setFormErrors(errorObj);
          return null;
        } else {
          setSnackbarErrorMessage(errorData.error);
          return null;
        }
      }

      const data = await res.json();
      setSnackbarMessage("Cronograma actualizado exitosamente");
      await fetchSchedules();
      return data;
    } catch (error) {
      setSnackbarErrorMessage("Error al actualizar el cronograma");
      console.error("Error al actualizar el cronograma:", error);
      return null;
    }
  }
  /* EDITAR CLASE (AGREGAR ASISTENCIA, OBSERVACIONES, ACTIVIDADES, CONTENIDO) */
  async function updateClass(classId, classData) {
    try {
      const res = await fetchWithAuth(
        `${CONFIG.API_URL}/schedules/classes/${classId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(classData),
        },
        refreshToken,
        logout
      );

      if (!res.ok) {
        const errorData = await res.json();
        setSnackbarErrorMessage(errorData.message);
        return null;
      }

      const data = await res.json();
      setSnackbarMessage("Clase actualizada exitosamente");
      return data;
    } catch (error) {
      setSnackbarErrorMessage("Error al actualizar la clase");
      console.error("Error al actualizar la clase:", error);
      return null;
    }
  }

  const value = {
    schedules,
    formErrors,
    setFormErrors,
    scheduleCreated,
    createSchedule,
    getScheduleByGroupId,
    updateSchedule,
    fetchSchedules,
    fetchClassesByDateAndCompany,
    fetchClassesByGroupId,
    getClassById,
    errorMessage,
    classes,
    setClasses,
    classesByGroupId,
    setClassesByGroupId,
    updateClass,
    classInfo,
    setClassInfo,
  };

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error("useSchedule debe usarse dentro de un ScheduleProvider");
  }
  return context;
};
