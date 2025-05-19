import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CONFIG from "../../config/api";
import { useDashboard } from "./dashboard";
import { useAuth } from "./auth";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
const CompanyContext = createContext();

export const CompanyProvider = ({ children }) => {
  const { setSnackbarMessage, setSnackbarErrorMessage } = useDashboard();
  const { refreshToken, logout } = useAuth();
  const [errorMessage, setErrorMessage] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [companyCreated, setCompanyCreated] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [companiesInfo, setCompaniesInfo] = useState([]);

  const [costCenters, setCostCenters] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [companies, setCompanies] = useState([]);
  const router = useRouter();
  /* HANDLE PARA CREAR DATOS PRINCIPALES DE LA EMPRESA */
  async function handleSubmitCompany(dataToSend) {
    setFormErrors({});
    setErrorMessage("");
    try {
      const res = await fetchWithAuth(
        `${CONFIG.API_URL}/companies`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: dataToSend.name,
            cuit: Number(dataToSend.cuit),
            business_name: dataToSend.business_name,
            first_survey_link: dataToSend.first_survey_link,
            second_survey_link: dataToSend.second_survey_link,
          }),
        },
        refreshToken,
        logout
      );
      if (res.status !== 201) {
        const errorData = await res.json();
        /* CREAMOS OBJETO DE ERRORES PARA PASAR AL FORM COMPONENT */
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
      return data;
    } catch (err) {
      setErrorMessage(err.error);
      console.error("Error al crear empresa: ", err);
    }
  }
  /* CREAMOS UN CENTRO DE COSTO */
  async function handleSubmitCostCenter(dataToSend, newCompanyId) {
    setFormErrors({});
    setErrorMessage("");
    try {
      const res = await fetchWithAuth(
        `${CONFIG.API_URL}/companies/${newCompanyId}/cost-centers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: dataToSend.name,
          }),
        },
        refreshToken,
        logout
      );
      if (res.status !== 201) {
        const errorData = await res.json();
        /* CREAMOS OBJETO DE ERRORES PARA PASAR AL FORM COMPONENT */
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
      setSnackbarMessage("Nuevo centro de costo agregado correctamente.");
      setUpdated((prev) => !prev);
      return data;
    } catch (err) {
      setErrorMessage(err.error);
      console.error("Error al crear el centro de costo: ", err);
    }
  }
  /* CREAMOS UN SECTOR */
  async function handleSubmitSector(dataToSend, newCompanyId) {
    setFormErrors({});
    setErrorMessage("");
    try {
      const res = await fetchWithAuth(
        `${CONFIG.API_URL}/companies/${newCompanyId}/sectors`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: dataToSend.name,
          }),
        },
        refreshToken,
        logout
      );
      if (res.status !== 201) {
        const errorData = await res.json();
        /* CREAMOS OBJETO DE ERRORES PARA PASAR AL FORM COMPONENT */
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
      setSnackbarMessage("Nuevo sector agregado correctamente.");
      setUpdated((prev) => !prev);
      return data;
    } catch (err) {
      setErrorMessage(err.error);
      console.error("Error al crear el Sector: ", err);
    }
  }
  /* CREAMOS UN CONTACTO */
  async function handleSubmitContact(dataToSend, newCompanyId) {
    setFormErrors({});
    setErrorMessage("");
    try {
      const res = await fetchWithAuth(
        `${CONFIG.API_URL}/companies/${newCompanyId}/contacts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: dataToSend.name,
            email: dataToSend.email,
            notes: dataToSend.notes,
          }),
        },
        refreshToken,
        logout
      );
      if (res.status !== 201) {
        const errorData = await res.json();
        /* CREAMOS OBJETO DE ERRORES PARA PASAR AL FORM COMPONENT */
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
      setSnackbarMessage("Nuevo contacto agregado correctamente.");
      setUpdated((prev) => !prev);
      return data;
    } catch (err) {
      setErrorMessage(err.error);
      console.error("Error al crear el centro de costo: ", err);
    }
  }

  const fetchCompany = async (companyId) => {
    try {
      const response = await fetchWithAuth(
        `${CONFIG.API_URL}/companies/${companyId}`,
        {
          method: "GET",
        },
        refreshToken,
        logout
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Fallo al buscar empresas:", data.error);
    }
  };
  const fetchCostCenters = async (companyId) => {
    try {
      const response = await fetchWithAuth(
        `${CONFIG.API_URL}/companies/${companyId}/cost-centers`,
        {
          method: "GET",
        },
        refreshToken,
        logout
      );
      const data = await response.json();
      setCostCenters(data);
      return data;
    } catch (error) {
      console.log("Fallo al buscar empresas:", error);
      return [];
    }
  };
  const fetchContacts = async (companyId) => {
    try {
      const response = await fetchWithAuth(
        `${CONFIG.API_URL}/companies/${companyId}/contacts`,
        {
          method: "GET",
        },
        refreshToken,
        logout
      );
      const data = await response.json();
      setContacts(data);
      return data;
    } catch (error) {
      console.log("Fallo al buscar empresas:", error);
      return [];
    }
  };
  const fetchSectors = async (companyId) => {
    try {
      const response = await fetchWithAuth(
        `${CONFIG.API_URL}/companies/${companyId}/sectors`,
        {
          method: "GET",
        },
        refreshToken,
        logout
      );
      const data = await response.json();
      setSectors(data);
      return data;
    } catch (error) {
      console.log("Fallo al buscar empresas:", error);
      return [];
    }
  };
  /* FUNCION PARA OBTENER TODAS LAS EMPRESAS COMPLETAS CON SUS CC, SECTORES Y CONTACTOS */
  const fetchCompaniesInfo = async () => {
    try {
      const response = await fetchWithAuth(
        `${CONFIG.API_URL}/companies`,
        {
          method: "GET",
        },
        refreshToken,
        logout
      );

      const companiesData = await response.json();
      // Verificamos si companiesData es un array
      if (!Array.isArray(companiesData)) {
        setErrorMessage("No se encontraron empresas");
        return null;
      }

      // Llamamos los datos de cada empresa
      const enrichedCompanies = await Promise.all(
        companiesData.map(async (company) => {
          const [costCentersData, contactsData, sectorsData] =
            await Promise.all([
              fetchCostCenters(company.id),
              fetchContacts(company.id),
              fetchSectors(company.id),
            ]);

          // CHEQUEAMOS SI LA RESPUESTA ES UNA ARRAY Y LA DEVOLVEMOS,
          // SI NO DEVOLVEMOS .data (QUE DEBERÍA SER UN ARRAY VACÍO) O UN ARRAY VACÍO DIRECTAMENTE
          const extractData = (apiResponse) =>
            Array.isArray(apiResponse) ? apiResponse : apiResponse.data || [];

          const costCenters = extractData(costCentersData).filter(
            (cc) => cc.company_id === company.id
          );

          const contacts = extractData(contactsData).filter(
            (contact) => contact.company_id === company.id
          );

          const sectors = extractData(sectorsData).filter(
            (sector) => sector.company_id === company.id
          );

          return {
            ...company,
            costCenters,
            contacts,
            sectors,
          };
        })
      );
      setCompanies(enrichedCompanies);
    } catch (error) {
      console.error("Fallo al buscar empresas:", error);
    }
  };
  /* FUNCION PARA OBTENER INFORMACION BÁSICA (NOMBRE) DE LA EMPRESA */
  const fetchCompaniesToSelect = async () => {
    try {
      const response = await fetchWithAuth(
        `${CONFIG.API_URL}/companies`,
        {
          method: "GET",
        },
        refreshToken,
        logout
      );

      const companiesData = await response.json();
      if (response.ok) {
        if (Array.isArray(companiesData)) {
          setCompaniesInfo(companiesData);
        } else if (companiesData.success && companiesData.data.length === 0) {
          setCompaniesInfo([]);
          setSnackbarErrorMessage(companiesData.message);
        }
      } else {
        setSnackbarErrorMessage(companiesData.message);
      }
    } catch (error) {
      setSnackbarErrorMessage("Error de red al buscar empresas");
      console.error("Error al buscar empresas:", error);
    }
  };
  /* ACTUALIZAMOS EMPRESA */
  async function updateCompany(dataToUpdate, companyId) {
    try {
      const res = await fetchWithAuth(
        `${CONFIG.API_URL}/companies/${companyId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: dataToUpdate.name,
            cuit: Number(dataToUpdate.cuit),
            business_name: dataToUpdate.business_name,
            first_survey_link: dataToUpdate.first_survey_link,
            second_survey_link: dataToUpdate.second_survey_link,
          }),
        },
        refreshToken,
        logout
      );
      if (!res.ok) {
        const errorData = await res.json();
        setSnackbarErrorMessage(errorData.error);
        return;
      }
      const data = await res.json();
      setSnackbarMessage(data.message);
      setUpdated((prev) => !prev);
      return data;
    } catch (err) {
      console.error("Error al actualizar la empresa: ", err);
    }
  }
  /* ELIMINAMOS UNA EMRPESA */
  async function deleteCompany(id) {
    try {
      const res = await fetchWithAuth(
        `${CONFIG.API_URL}/companies/${id}`,
        {
          method: "delete",
        },
        refreshToken,
        logout
      );
      const data = await res.json();
      if (!res.ok) {
        setSnackbarErrorMessage(data.error);
      }
      setSnackbarMessage(data.message);
      router.replace("/empresas");
    } catch (error) {
      console.error("error al eliminar empresa", error);
    }
  }
  /* ACTUALIZAMOS UN CENTRO DE COSTO */
  async function updateCostCenter(dataToUpdate, companyId, costCenterId) {
    setFormErrors({});
    setErrorMessage("");
    try {
      const res = await fetchWithAuth(
        `${CONFIG.API_URL}/companies/${companyId}/cost-centers/${costCenterId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: dataToUpdate.name,
          }),
        },
        refreshToken,
        logout
      );
      if (!res.ok) {
        const errorData = await res.json();
        setSnackbarErrorMessage(errorData.error);
        return;
      }
      const data = await res.json();
      setSnackbarMessage(data.message);
      setUpdated((prev) => !prev);
      return data;
    } catch (err) {
      console.error("Error al actualizar el centro de costo: ", err);
    }
  }
  /* ELIMINAMOS UN CENTRO DE COSTO */
  async function deleteCostCenter(companyId, costCenterId) {
    setErrorMessage("");
    try {
      const res = await fetchWithAuth(
        `${CONFIG.API_URL}/companies/${companyId}/cost-centers/${costCenterId}`,
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
      const data = await res.json();
      setSnackbarMessage(data.message);
      setUpdated((prev) => !prev);
      return data;
    } catch (err) {
      console.error("Error al eliminar el centro de costo: ", err);
    }
  }

  /* ACTUALIZAMOS UN CONTACTO */
  async function updateContact(dataToUpdate, companyId, contactId) {
    setFormErrors({});
    setErrorMessage("");
    try {
      const res = await fetchWithAuth(
        `${CONFIG.API_URL}/companies/${companyId}/contacts/${contactId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: dataToUpdate.name,
            email: dataToUpdate.email,
            notes: dataToUpdate.notes,
          }),
        },
        refreshToken,
        logout
      );
      if (!res.ok) {
        const errorData = await res.json();
        console.log(errorData.error);
        setSnackbarErrorMessage(errorData.error);
        return;
      }
      const data = await res.json();
      setSnackbarMessage(data.message);
      setUpdated((prev) => !prev);
      return data;
    } catch (err) {
      console.error("Error al actualizar el contacto: ", err);
    }
  }

  /* ELIMINAMOS UN CONTACTO */
  async function deleteContact(companyId, contactId) {
    setErrorMessage("");
    try {
      const res = await fetchWithAuth(
        `${CONFIG.API_URL}/companies/${companyId}/contacts/${contactId}`,
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
      const data = await res.json();
      setSnackbarMessage(data.message);
      setUpdated((prev) => !prev);
      return data;
    } catch (err) {
      console.error("Error al eliminar el contacto: ", err);
    }
  }

  /* ACTUALIZAMOS UN SECTOR */
  async function updateSector(dataToUpdate, companyId, sectorId) {
    setFormErrors({});
    setErrorMessage("");
    try {
      const res = await fetchWithAuth(
        `${CONFIG.API_URL}/companies/${companyId}/sectors/${sectorId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: dataToUpdate.name,
          }),
        },
        refreshToken,
        logout
      );
      if (!res.ok) {
        const errorData = await res.json();
        setSnackbarErrorMessage(errorData.error);
        return;
      }
      const data = await res.json();
      setSnackbarMessage(data.message);
      setUpdated((prev) => !prev);
      return data;
    } catch (err) {
      console.error("Error al actualizar el sector: ", err);
    }
  }

  /* ELIMINAMOS UN SECTOR */
  async function deleteSector(companyId, sectorId) {
    setErrorMessage("");
    try {
      const res = await fetchWithAuth(
        `${CONFIG.API_URL}/companies/${companyId}/sectors/${sectorId}`,
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
      const data = await res.json();
      setSnackbarMessage(data.message);
      setUpdated((prev) => !prev);
      return data;
    } catch (err) {
      console.error("Error al eliminar el sector: ", err);
    }
  }

  return (
    <CompanyContext.Provider
      value={{
        companiesInfo,
        companies,
        costCenters,
        contacts,
        sectors,

        handleSubmitCompany,
        handleSubmitCostCenter,
        handleSubmitContact,
        handleSubmitSector,

        errorMessage,
        formErrors,
        setErrorMessage,

        fetchCompany,
        fetchCompaniesInfo,
        fetchCostCenters,
        fetchContacts,
        fetchSectors,
        fetchCompaniesToSelect,

        updateCompany,
        deleteCompany,
        updateCostCenter,
        deleteCostCenter,
        updateContact,
        deleteContact,
        updateSector,
        deleteSector,

        updated,
        setUpdated,
        companyCreated,
        setCompanyCreated,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  return useContext(CompanyContext);
};
