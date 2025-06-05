"use client";
import { createContext, useContext, useState } from "react";
import CONFIG from "../../config/api";

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const [selectedCompany, setSelectedCompany] = useState("");
  const [toolbarButtonAction, setToolbarButtonAction] = useState(null);
  const [toolbarExportAction, setToolbarExportAction] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarErrorMessage, setSnackbarErrorMessage] = useState("");
  const [snackbarWarningMessage, setSnackbarWarningMessage] = useState("");
  const [languages, setLanguages] = useState([]);
  const [levels, setLevels] = useState([]);
  const [modules, setModules] = useState([]);
  const [professionalCategories, setProfessionalCategories] = useState([]);
  const [modalities, setModalities] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [roles, setRoles] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  async function fetchModules() {
    try {
      const res = await fetch(`${CONFIG.API_URL}/settings/modules`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setSnackbarErrorMessage(data.message);
      }
      setModules(data);
      return data;
    } catch (error) {
      console.log("error al buscar los módulos", error);
    }
  }
  async function fetchLanguages() {
    try {
      const res = await fetch(`${CONFIG.API_URL}/settings/languages`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setSnackbarErrorMessage(data.message);
      }
      setLanguages(data);
      return data;
    } catch (error) {
      console.log("error al buscar los idiomas", error);
    }
  }
  async function fetchLevels() {
    try {
      const res = await fetch(`${CONFIG.API_URL}/settings/levels`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setSnackbarErrorMessage(data.message);
      }
      setLevels(data);
      return data;
    } catch (error) {
      console.log("error al buscar los niveles", error);
    }
  }
  async function fetchProfessionalCategories() {
    try {
      const res = await fetch(
        `${CONFIG.API_URL}/settings/professional-categories`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setSnackbarErrorMessage(data.message);
      }
      setProfessionalCategories(data);
      return data;
    } catch (error) {
      console.log("error al buscar las categorías profesionales", error);
    }
  }
  async function fetchModalities() {
    try {
      const res = await fetch(`${CONFIG.API_URL}/settings/modalities`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setSnackbarErrorMessage(data.message);
      }
      setModalities(data);
      return data;
    } catch (error) {
      console.log("error al buscar las modalidades", error);
    }
  }
  async function fetchStatuses() {
    try {
      const res = await fetch(`${CONFIG.API_URL}/settings/statuses`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setSnackbarErrorMessage(data.message);
      }
      setStatuses(data);
      return data;
    } catch (error) {
      console.log("error al buscar los estados", error);
    }
  }
  async function fetchRoles() {
    try {
      const res = await fetch(`${CONFIG.API_URL}/settings/roles`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setSnackbarErrorMessage(data.message);
      }
      setRoles(data);
      return data;
    } catch (error) {
      console.log("error al buscar los roles", error);
    }
  }
  return (
    <DashboardContext.Provider
      value={{
        selectedCompany,
        toolbarButtonAction,
        toolbarExportAction,
        openSnackbar,
        snackbarMessage,
        snackbarErrorMessage,
        snackbarWarningMessage,
        setSelectedCompany,
        setToolbarButtonAction,
        setToolbarExportAction,
        setOpenSnackbar,
        setSnackbarMessage,
        setSnackbarErrorMessage,
        setSnackbarWarningMessage,

        fetchModules,
        fetchLanguages,
        fetchLevels,
        fetchProfessionalCategories,
        fetchModalities,
        fetchStatuses,
        fetchRoles,
        languages,
        levels,
        modules,
        professionalCategories,
        modalities,
        statuses,
        roles,
        
        sidebarCollapsed,
        setSidebarCollapsed,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  return useContext(DashboardContext);
}
