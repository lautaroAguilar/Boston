import React, { createContext, useContext, useState, useEffect } from "react";
import CONFIG from "../../config/api";
import { useDashboard } from "./dashboard";

const StudentContext = createContext();

export const StudentProvider = ({ children }) => {
  const { setSnackbarErrorMessage, setSnackbarMessage } = useDashboard();
  const [students, setStudents] = useState([]);
  const [updated, setUpdated] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const createStudent = async (studentData) => {
    try {
      const res = await fetch(`${CONFIG.API_URL}/students`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData),
      });
      const data = res.json();
      if (!res.ok) {
        setSnackbarErrorMessage(data.error);
      }
      setSnackbarMessage("Alumno creado correctamente");
      setUpdated((prev) => !prev);
      return data;
    } catch (error) {
      console.log("Error de red al crear estudiante:", error);
    }
  };
  const fetchStudents = async () => {
    try {
      const res = await fetch(`${CONFIG.API_URL}/students`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setSnackbarErrorMessage(data.message);
      }
      setStudents(data);
    } catch (error) {
      console.log("Error de red al buscar estudiantes:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <StudentContext.Provider
      value={{ students, errorMessage, updated, createStudent }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => useContext(StudentContext);
