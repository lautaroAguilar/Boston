"use client";
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
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentById = async (id) => {
    setLoading(true);
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
      return data;
    } catch (error) {
      console.log("Error de red al buscar estudiante por ID:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateStudent = async (id, studentData) => {
    setLoading(true);
    try {
      const res = await fetch(`${CONFIG.API_URL}/students/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData),
      });
      const data = await res.json();
      if (!res.ok) {
        setSnackbarErrorMessage(data.message);
        return null;
      }
      setSnackbarMessage("Estudiante actualizado correctamente");
      setUpdated((prev) => !prev);
      
      // Actualizar el estudiante localmente si es el que estamos viendo actualmente
      if (student && student.student_id === parseInt(id)) {
        fetchStudentById(id);
      }
      
      return data;
    } catch (error) {
      console.log("Error de red al actualizar estudiante:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteStudent = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`${CONFIG.API_URL}/students/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setSnackbarErrorMessage(data.message);
        return false;
      }
      setSnackbarMessage("Estudiante eliminado correctamente");
      setUpdated((prev) => !prev);
      
      // Actualizar la lista de estudiantes
      setStudents(students.filter(s => s.student_id !== parseInt(id)));
      
      // Si el estudiante actual es el que se está eliminando, limpiar el estado
      if (student && student.student_id === parseInt(id)) {
        setStudent(null);
      }
      
      return true;
    } catch (error) {
      console.log("Error de red al eliminar estudiante:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Métodos para gestionar inscripciones a cursos
  const fetchEnrollments = async (studentId) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${CONFIG.API_URL}/students/${studentId}/enrollments`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setSnackbarErrorMessage(data.message || "Error al obtener inscripciones");
        return [];
      }
      return data.data;
    } catch (error) {
      console.log("Error de red al obtener inscripciones:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const updateEnrollment = async (studentId, enrollmentId, enrollmentData) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${CONFIG.API_URL}/students/${studentId}/enrollments/${enrollmentId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(enrollmentData),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setSnackbarErrorMessage(data.message || "Error al actualizar inscripción");
        return null;
      }
      
      setSnackbarMessage("Inscripción actualizada correctamente");
      
      // Actualizar el estudiante para reflejar los cambios
      await fetchStudentById(studentId);
      
      return data.data;
    } catch (error) {
      console.log("Error de red al actualizar inscripción:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const completeCourse = async (studentId, enrollmentId, data = {}) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${CONFIG.API_URL}/students/${studentId}/enrollments/${enrollmentId}/complete`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      const responseData = await res.json();
      if (!res.ok) {
        setSnackbarErrorMessage(responseData.message || "Error al completar curso");
        return null;
      }
      
      setSnackbarMessage("Curso completado correctamente");
      
      // Actualizar el estudiante para reflejar los cambios
      await fetchStudentById(studentId);
      
      return responseData.data;
    } catch (error) {
      console.log("Error de red al completar curso:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCompany) {
      fetchStudents();
    }
  }, [selectedCompany, updated]);

  return (
    <StudentContext.Provider
      value={{
        students,
        errorMessage,
        updated,
        student,
        loading,
        createStudent,
        fetchStudents,
        fetchStudentById,
        updateStudent,
        deleteStudent,
        fetchEnrollments,
        createEnrollment,
        updateEnrollment,
        completeCourse
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => useContext(StudentContext);
