import React, { createContext, useContext, useEffect, useState } from "react";
import CONFIG from "../../config/api";

const CompanyContext = createContext();

export const CompanyProvider = ({ children }) => {
  const [companiesInfo, setCompaniesInfo] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyId, setCompanyId] = useState(false);
  const [costCenters, setCostCenters] = useState(false);
  const [contacts, setContacts] = useState(false);
  const [sectors, setSectors] = useState(false);

  const selectCompany = async (companyId) => {
    try {
      setSelectedCompany(companyId);
      const response = await fetch(`${CONFIG.API_URL}/companies/${companyId}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      setCompanyId(data.id);
      console.log(data);
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
      console.log(data);
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
      console.log(data);
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
      console.log(data);
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
      setCompaniesInfo(companiesData);
      console.log("Empresas:", companiesData);

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

      console.log("Empresas con información completa:", enrichedCompanies);
      setCompanies(enrichedCompanies);
    } catch (error) {
      console.error("Fallo al buscar empresas:", error);
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

        selectCompany,
        fetchCompaniesInfo,
        fetchCostCenters,
        fetchContacts,
        fetchSectors,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  return useContext(CompanyContext);
};
