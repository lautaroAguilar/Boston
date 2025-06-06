import React, { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import CONFIG from "../../config/api";
import { useDashboard } from "./dashboard";
import { useAuth } from "./auth";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { formatDateForAPI } from "@/utils/dateUtils";
const TeacherContext = createContext();

export const TeacherProvider = ({ children }) => {
  const { refreshToken, logout } = useAuth();
  const { setSnackbarMessage, setSnackbarErrorMessage } = useDashboard();
  const [errorMessage, setErrorMessage] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [teacherCreated, setTeacherCreated] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const router = useRouter();

  /* HANDLE PARA CREAR DOCENTE */
  async function handleSubmitTeacher(dataToSend) {
    setFormErrors({});
    setErrorMessage("");
    try {
      const res = await fetchWithAuth(
        `${CONFIG.API_URL}/teachers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...dataToSend,
            is_temp_password: true,
            fictitiousSeniority: formatDateForAPI(dataToSend.fictitiousSeniority),
            bostonSeniority: formatDateForAPI(dataToSend.bostonSeniority),
          }),
        },
        refreshToken,
        logout
      );

      if (res.status !== 201) {
        const errorData = await res.json();
        if (Array.isArray(errorData.errors)) {
          const errorObj = errorData.errors.reduce((acc, issue) => {
            const fieldName = issue.path[0];
            acc[fieldName] = issue.message;
            return acc;
          }, {});
          setFormErrors(errorObj);
        } else {
          setSnackbarErrorMessage(errorData.error);
        }
        return;
      }
      const data = await res.json();
      setSnackbarMessage("Docente creado exitosamente");
      setTeacherCreated(true);
      return data;
    } catch (err) {
      setErrorMessage(err.error);
      console.error("Error al crear docente: ", err);
    }
  }

  /* OBTENER TODOS LOS DOCENTES */
  const fetchTeachers = async () => {
    try {
      const response = await fetchWithAuth(
        `${CONFIG.API_URL}/teachers`,
        { method: "GET" },
        refreshToken,
        logout
      );
      const data = await response.json();
      if (!response.ok) {
        setSnackbarErrorMessage(data.message);
        return;
      }
      setSnackbarMessage(data.message);
      setTeachers(data.data);
      return data;
    } catch (error) {
      console.log("Error al buscar docentes:", error);
      return [];
    }
  };

  /* ACTUALIZAR DOCENTE */
  async function updateTeacher(dataToUpdate, teacherId) {
    setFormErrors({});
    setErrorMessage("");
    try {
      const res = await fetchWithAuth(
        `${CONFIG.API_URL}/teachers/${teacherId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToUpdate),
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
        } else {
          setSnackbarErrorMessage(errorData.error);
        }
        return;
      }
      const data = await res.json();
      setSnackbarMessage("Docente actualizado exitosamente");
      setUpdated((prev) => !prev);
      return data;
    } catch (err) {
      setErrorMessage(err.error);
      console.error("Error al actualizar docente: ", err);
    }
  }

  /* ELIMINAR DOCENTE */
  async function deleteTeacher(teacherId) {
    try {
      const res = await fetchWithAuth(
        `${CONFIG.API_URL}/teachers/${teacherId}`,
        { method: "DELETE" },
        refreshToken,
        logout
      );

      if (!res.ok) {
        const errorData = await res.json();
        setSnackbarErrorMessage(errorData.error);
        return;
      }

      setSnackbarMessage("Docente eliminado exitosamente");
      setUpdated((prev) => !prev);
    } catch (err) {
      setErrorMessage(err.error);
      console.error("Error al eliminar docente: ", err);
    }
  }

  return (
    <TeacherContext.Provider
      value={{
        teachers,
        errorMessage,
        formErrors,
        teacherCreated,
        updated,
        handleSubmitTeacher,
        fetchTeachers,
        updateTeacher,
        deleteTeacher,
      }}
    >
      {children}
    </TeacherContext.Provider>
  );
};

export const useTeacher = () => {
  const context = useContext(TeacherContext);
  if (!context) {
    throw new Error("useTeacher debe ser usado dentro de TeacherProvider");
  }
  return context;
};
