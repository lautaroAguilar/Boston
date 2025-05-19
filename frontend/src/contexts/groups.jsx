import React, { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import CONFIG from "../../config/api";
import { useDashboard } from "./dashboard";
import { useAuth } from "./auth";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
const GroupContext = createContext();

export const GroupProvider = ({ children }) => {
  const { refreshToken, logout } = useAuth();
  const { setSnackbarMessage, setSnackbarErrorMessage, setSnackbarWarningMessage } = useDashboard();
  const [errorMessage, setErrorMessage] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [groupCreated, setGroupCreated] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [groups, setGroups] = useState([]);
  const router = useRouter();

  /* HANDLE PARA CREAR GRUPO */
  async function handleSubmitGroup(dataToSend, companyId) {
    setFormErrors({});
    setErrorMessage("");
    try {
      const res = await fetchWithAuth(
        `${CONFIG.API_URL}/groups`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
          name: dataToSend.name,
          teacherId: Number(dataToSend.teacherId),
          languageId: Number(dataToSend.languageId),
          moduleId: Number(dataToSend.moduleId),
          modalityId: Number(dataToSend.modalityId),
          students: dataToSend.students,
          companyId: companyId,
        }),
      },
        refreshToken,
        logout
      );
      
      if (!res.ok) {
        const errorData = await res.json();
        if (Array.isArray(errorData)) {
          // Crear objeto de errores para el formulario
          const errorObj = errorData.reduce((acc, issue) => {
            const fieldName = issue.path[0];
            acc[fieldName] = issue.message;
            return acc;
          }, {});
          setFormErrors(errorObj);

          // Si hay un error de companyId, mostrar el mensaje en el snackbar
          if (errorData.some(error => error.path[0] === 'companyId')) {
            setSnackbarWarningMessage("Selecciona una empresa por favor");
          }
        } else {
          setSnackbarErrorMessage(errorData.message);
        }
        return;
      }
      const data = await res.json();
      setSnackbarMessage("Grupo creado exitosamente");
      setGroupCreated(true);
      return data;
    } catch (err) {
      setErrorMessage(err.error);
      console.error("Error al crear grupo: ", err);
    }
  }

  /* OBTENER TODOS LOS GRUPOS */
  const fetchGroups = async (selectedCompany) => {
    try {
      const response = await fetchWithAuth(
        `${CONFIG.API_URL}/groups?companyId=${selectedCompany}`,
        {
          method: "GET",
        },
        refreshToken,
        logout
      );
      const data = await response.json();
      if (!response.ok) {
        setSnackbarErrorMessage(data.message);
        return;
      }
      setGroups(data.data);
      return data;
    } catch (error) {
      console.log("Error al buscar grupos:", error);
      return [];
    }
  };

  /* OBTENER GRUPO POR ID */
  const fetchGroupById = async (groupId) => {
    try {
      const response = await fetchWithAuth(
        `${CONFIG.API_URL}/groups/${groupId}`,
        {
          method: "GET",
        },
        refreshToken,
        logout
      );
      const data = await response.json();
      if (!response.ok) {
        setSnackbarErrorMessage(data.message);
        return null;
      }
      return data.data;
    } catch (error) {
      console.log("Error al buscar grupo:", error);
      setSnackbarErrorMessage("Error al obtener información del grupo");
      return null;
    }
  };

  /* ACTUALIZAR GRUPO */
  async function updateGroup(dataToUpdate, groupId) {
    setFormErrors({});
    setErrorMessage("");
    try {
      const res = await fetchWithAuth(
        `${CONFIG.API_URL}/groups/${groupId}`,
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
      setSnackbarMessage("Grupo actualizado exitosamente");
      setUpdated((prev) => !prev);
      return data;
    } catch (err) {
      setErrorMessage(err.error);
      console.error("Error al actualizar grupo: ", err);
    }
  }

  /* ELIMINAR GRUPO */
  async function deleteGroup(groupId) {
    try {
      const res = await fetchWithAuth(
        `${CONFIG.API_URL}/groups/${groupId}`,
        {
          method: "DELETE",
        },
        refreshToken,
        logout
      );
      if (!res.ok) {
        const errorData = await res.json();
        setSnackbarErrorMessage(errorData.error);
        return;
      }

      setSnackbarMessage("Grupo eliminado exitosamente");
      setUpdated((prev) => !prev);
    } catch (err) {
      setErrorMessage(err.error);
      console.error("Error al eliminar grupo: ", err);
    }
  }

  return (
    <GroupContext.Provider
      value={{
        groups,
        errorMessage,
        formErrors,
        groupCreated,
        updated,
        handleSubmitGroup,
        fetchGroups,
        fetchGroupById,
        updateGroup,
        deleteGroup,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};

export const useGroup = () => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error("useGroup debe ser usado dentro de GroupProvider");
  }
  return context;
};
