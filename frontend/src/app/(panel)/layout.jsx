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
function CustomAppTitle() {
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Typography variant="h6">Boston</Typography>
    </Stack>
  );
}
/* CREAMOS COMPONENTE PARA FILTRAR POR EMPRESA EN EL HEADER DEL LAYOUT */
function CustomSelectCompany() {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const { companiesInfo, fetchCompaniesToSelect } = useCompany();

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
  }, []);
  const isMobile = useMediaQuery("(max-width:600px)");
  return (
    <Stack direction={"row"} alignItems={"center"} spacing={2}>
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
          {companiesInfo.map((opt) => (
            <MenuItem key={opt.id} value={opt.id}>
              {opt.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <ThemeSwitcher />
    </Stack>
  );
}
function CustomPageToolbar({ toolbarButtonAction }) {
  return (
    <PageHeaderToolbar>
      <Stack>
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
  const { toolbarButtonAction } = useDashboard();
  const CustomPageToolbarComponent = useCallback(
    () => <CustomPageToolbar toolbarButtonAction={toolbarButtonAction} />,
    [toolbarButtonAction]
  );

  return <PageHeader slots={{ toolbar: CustomPageToolbarComponent }} />;
}
export default function DashboardRootLayout({ children }) {
  const CustomPageHeaderComponent = useCallback(() => <CustomPageHeader />, []);
  const { snackbarMessage, snackbarErrorMessage, openSnackbar } =
    useDashboard();
  return (
    <DashboardLayout
      defaultSidebarCollapsed
      slots={{
        appTitle: CustomAppTitle,
        toolbarActions: CustomSelectCompany,
      }}
    >
      <PageContainer slots={{ header: CustomPageHeaderComponent }}>
        {children}
        <MySnackbar
          open={openSnackbar}
          message={snackbarMessage}
          errorMessage={snackbarErrorMessage}
        />
      </PageContainer>
    </DashboardLayout>
  );
}
