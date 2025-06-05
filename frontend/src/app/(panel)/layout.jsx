"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  useMediaQuery,
} from "@mui/material";
import {
  DashboardLayout,
  PageContainer,
  PageHeaderToolbar,
  PageHeader,
  ThemeSwitcher,
} from "@toolpad/core";
import { useCompany } from "@/contexts/companies";
import { useDashboard } from "@/contexts/dashboard";
import CONFIG from "../../../config/api";
import MySnackbar from "@/components/Snackbar";
import AccountMenu from "@/components/AccountMenu";
import { useAuth } from "@/contexts/auth";
function CustomAppTitle() {
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Typography variant="h6">Boston</Typography>
    </Stack>
  );
}
/* CREAMOS COMPONENTE PARA FILTRAR POR EMPRESA EN EL HEADER DEL LAYOUT */
function CustomSelectCompany() {
  const { selectedCompany, setSelectedCompany } = useDashboard();
  const { companiesInfo, fetchCompaniesToSelect, companyCreated } =
    useCompany();

  const fetchCompanyId = async (companyId) => {
    try {
      setSelectedCompany(companyId);
      const response = await fetch(`${CONFIG.API_URL}/companies/${companyId}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Fallo al buscar empresas:", error);
    }
  };

  useEffect(() => {
    fetchCompaniesToSelect();
  }, [companyCreated]);
  const isMobile = useMediaQuery("(max-width:600px)");
  return (
    <FormControl fullWidth size="small">
      <InputLabel id="company">Empresa</InputLabel>
      <Select
        name={selectedCompany}
        labelId="company"
        id="selectCompany"
        value={selectedCompany || ""}
        label={"Empresa"}
        onChange={(e) => {
          fetchCompanyId(e.target.value);
        }}
        sx={{ width: isMobile ? "120px" : "200px" }}
      >
        {companiesInfo.length > 0 ? (
          companiesInfo.map((opt) => (
            <MenuItem key={opt.id} value={opt.id}>
              {opt.name}
            </MenuItem>
          ))
        ) : (
          <MenuItem value="">No hay empresas disponibles</MenuItem>
        )}
      </Select>
    </FormControl>
  );
}

/* Componente para las acciones en el toolbar */
function CustomToolbarActions() {
  const { user } = useAuth();
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <CustomSelectCompany />
      <ThemeSwitcher />
      {user && <AccountMenu />}
    </Stack>
  );
}

function CustomPageToolbar({ toolbarButtonAction, toolbarExportAction }) {
  return (
    <PageHeaderToolbar>
      <Stack direction="row" spacing={2}>
        {toolbarExportAction ? (
          <Button
            variant="outlined"
            onClick={toolbarExportAction.action}
            disabled={toolbarExportAction.disabled}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 1,
            }}
          >
            {toolbarExportAction.label}
            {toolbarExportAction.icon}
          </Button>
        ) : null}
        {toolbarButtonAction ? (
          <Button
            variant="contained"
            onClick={toolbarButtonAction.action}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 1,
            }}
          >
            {toolbarButtonAction.label}
            {toolbarButtonAction.icon}
          </Button>
        ) : null}
      </Stack>
    </PageHeaderToolbar>
  );
}

function CustomPageHeader() {
  const { toolbarButtonAction, toolbarExportAction } = useDashboard();
  const CustomPageToolbarComponent = useCallback(
    () => <CustomPageToolbar 
      toolbarButtonAction={toolbarButtonAction} 
      toolbarExportAction={toolbarExportAction}
    />,
    [toolbarButtonAction, toolbarExportAction]
  );

  return <PageHeader slots={{ toolbar: CustomPageToolbarComponent }} />;
}
export default function DashboardRootLayout({ children }) {
  const CustomPageHeaderComponent = useCallback(() => <CustomPageHeader />, []);
  const { checkUserSession } = useAuth();
  const {
    snackbarMessage,
    snackbarErrorMessage,
    snackbarWarningMessage,
    openSnackbar,
    sidebarCollapsed,
    setSidebarCollapsed,
  } = useDashboard();

  // Intentamos manejar el cambio de estado del sidebar cuando se hace clic en el botón de colapso
  const handleSidebarStateChange = useCallback(
    (collapsed) => {
      setSidebarCollapsed(collapsed);
    },
    [setSidebarCollapsed]
  );

  useEffect(() => {
    checkUserSession();
  }, []);

  return (
    <DashboardLayout
      defaultSidebarCollapsed={sidebarCollapsed}
      onSidebarStateChange={handleSidebarStateChange}
      slots={{
        appTitle: CustomAppTitle,
        toolbarActions: CustomToolbarActions,
      }}
    >
      <PageContainer slots={{ header: CustomPageHeaderComponent }}>
        {children}
        <MySnackbar
          open={openSnackbar}
          message={snackbarMessage}
          errorMessage={snackbarErrorMessage}
          warningMessage={snackbarWarningMessage}
        />
      </PageContainer>
    </DashboardLayout>
  );
}
