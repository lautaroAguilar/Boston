import React, { createContext, useContext, useState, useEffect } from "react";
import CONFIG from "../../config/api";
import { useDashboard } from "./dashboard";

const StudentContext = createContext();

export const StudentProvider = ({ children }) => {
  const { setSnackbarErrorMessage, setSnackbarMessage, selectedCompany } =
    useDashboard();
  const [students, setStudents] = useState([]);
  const [student, setStudent] = useState(null);
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
      const data = await res.json();

      if (!res.ok) {
        if (Array.isArray(data)) {
          const errorObj = data.reduce((acc, issue) => {
            const fieldName = issue.path[0];
            acc[fieldName] = issue.message;
            return acc;
          }, {});
          setFormErrors(errorObj);
        } else {
          setSnackbarErrorMessage(data.error);
        }
        return;
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
      const res = await fetch(
        `${CONFIG.API_URL}/students?companyId=${selectedCompany}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setSnackbarErrorMessage(data.message);
      }
      setStudents(data.data);
    } catch (error) {
      console.log("Error de red al buscar estudiantes:", error);
    }
  };
  const fetchStudentById = async (id) => {
    try {
      const res = await fetch(`${CONFIG.API_URL}/students/${id}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setSnackbarErrorMessage(data.message);
      }
      setSnackbarMessage("Estudiante encontrado correctamente");
      setStudent(data);
    } catch (error) {
      console.log("Error de red al buscar estudiante por ID:", error);
    }
  };

  return (
    <StudentContext.Provider
      value={{
        students,
        errorMessage,
        updated,
        student,
        createStudent,
        fetchStudents,
        fetchStudentById,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => useContext(StudentContext);
