import React, { createContext, useContext, useEffect, useState } from "react";
import CONFIG from "../../config/api";

const CompanyContext = createContext();

export const CompanyProvider = ({ children }) => {
  const [errorMessage, setErrorMessage] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [companiesInfo, setCompaniesInfo] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyId, setCompanyId] = useState(false);
  const [costCenters, setCostCenters] = useState(false);
  const [contacts, setContacts] = useState(false);
  const [sectors, setSectors] = useState(false);

  /* HANDLE PARA CREAR DATOS PRINCIPALES DE LA EMPRESA */
  async function handleSubmitCompany(dataToSend) {
    setFormErrors({});
    setErrorMessage("");
    try {
      const res = await fetch(`${CONFIG.API_URL}/companies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: dataToSend.name,
          cuit: Number(dataToSend.cuit),
          business_name: dataToSend.business_name,
          sid: dataToSend.sid,
          survey_link: dataToSend.survey_link,
        }),
      });
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
          setErrorMessage(errorData.error);
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
      const res = await fetch(
        `${CONFIG.API_URL}/companies/${newCompanyId}/cost-centers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: dataToSend.name,
          }),
        }
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
          setErrorMessage(errorData.error);
        }
        return;
      }
      const data = await res.json();
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
      const res = await fetch(
        `${CONFIG.API_URL}/companies/${newCompanyId}/sectors`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: dataToSend.name,
          }),
        }
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
          setErrorMessage(errorData.error);
        }
        return;
      }
      const data = await res.json();
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
      const res = await fetch(
        `${CONFIG.API_URL}/companies/${newCompanyId}/contacts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: dataToSend.name,
            email: dataToSend.email,
            notes: dataToSend.notes,
          }),
        }
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
          setErrorMessage(errorData.error);
        }
        return;
      }
      const data = await res.json();
      return data;
    } catch (err) {
      setErrorMessage(err.error);
      console.error("Error al crear el centro de costo: ", err);
    }
  }

  const selectCompany = async (companyId) => {
    try {
      setSelectedCompany(companyId);
      const response = await fetch(`${CONFIG.API_URL}/companies/${companyId}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      setCompanyId(data.id);
      // Manejar la información de la empresa seleccionada
    } catch (error) {
      console.log("Fallo al buscar empresas:", error);
    }
  };
  const fetchCostCenters = async (companyId) => {
    try {
      const response = await fetch(
        `${CONFIG.API_URL}/companies/${companyId}/cost-centers`,
        {
          method: "GET",
          credentials: "include",
        }
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
      const response = await fetch(
        `${CONFIG.API_URL}/companies/${companyId}/contacts`,
        {
          method: "GET",
          credentials: "include",
        }
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
      const response = await fetch(
        `${CONFIG.API_URL}/companies/${companyId}/sectors`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await response.json();
      setSectors(data);
      return data;
    } catch (error) {
      console.log("Fallo al buscar empresas:", error);
      return [];
    }
  };
  const fetchCompaniesInfo = async () => {
    try {
      const response = await fetch(`${CONFIG.API_URL}/companies`, {
        method: "GET",
        credentials: "include",
      });

      const companiesData = await response.json();

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
  const fetchCompaniesToSelect = async () => {
    try {
      const response = await fetch(`${CONFIG.API_URL}/companies`, {
        method: "GET",
        credentials: "include",
      });

      const companiesData = await response.json();
      if (response.ok) {
        if (Array.isArray(companiesData)) {
          setCompaniesInfo(companiesData);
        } else if (companiesData.success && companiesData.data.length === 0) {
          setCompaniesInfo([]);
          setErrorMessage(companiesData.message);
        }
      } else {
        setErrorMessage(companiesData.message);
      }
    } catch (error) {
      setErrorMessage("Error de red al buscar empresas");
      console.error("Error al buscar empresas:", error);
    }
  };
  return (
    <CompanyContext.Provider
      value={{
        companiesInfo,
        companies,
        selectedCompany,
        companyId,
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

        selectCompany,
        fetchCompaniesInfo,
        fetchCostCenters,
        fetchContacts,
        fetchSectors,
        fetchCompaniesToSelect
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  return useContext(CompanyContext);
};
