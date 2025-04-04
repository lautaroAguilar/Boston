"use client";
import { createContext, useContext, useState } from "react";
import CONFIG from "../../config/api";

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const [selectedCompany, setSelectedCompany] = useState("");
  const [toolbarButtonAction, setToolbarButtonAction] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarErrorMessage, setSnackbarErrorMessage] = useState("");
  const [languages, setLanguages] = useState([]);
  const [levels, setLevels] = useState([]);
  const [modules, setModules] = useState([]);
  const [professionalCategories, setProfessionalCategories] = useState([]);
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

  return (
    <DashboardContext.Provider
      value={{
        selectedCompany,
        toolbarButtonAction,
        openSnackbar,
        snackbarMessage,
        snackbarErrorMessage,
        setSelectedCompany,
        setToolbarButtonAction,
        setOpenSnackbar,
        setSnackbarMessage,
        setSnackbarErrorMessage,

        fetchModules,
        fetchLanguages,
        fetchLevels,
        fetchProfessionalCategories,
        languages,
        levels,
        modules,
        professionalCategories,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  return useContext(DashboardContext);
}
