"use client";
import { useCallback } from "react";
import {
  Stack,
  Typography,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import {
  DashboardLayout,
  PageContainer,
  PageHeaderToolbar,
  PageHeader,
  ThemeSwitcher,
} from "@toolpad/core";
import { CheckCircleRounded } from "@mui/icons-material";
import { AuthProvider } from "@/contexts/auth";
import { useCompany } from "@/contexts/companies";
import { DashboardProvider, useDashboard } from "@/contexts/dashboard";
function CustomAppTitle() {
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Typography variant="h6">Boston</Typography>
      <Tooltip title="Connected to production">
        <CheckCircleRounded color="success" fontSize="small" />
      </Tooltip>
    </Stack>
  );
}
/* CREAMOS COMPONENTE PARA FILTRAR POR EMPRESA EN EL HEADER DEL LAYOUT */
function CustomSelectCompany() {
  const { companiesInfo, selectedCompany, selectCompany } = useCompany();
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
          onChange={(e) => selectCompany(e.target.value)}
          sx={{ width: "200px" }}
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
  return (
    <AuthProvider>
      <DashboardProvider>
        <DashboardLayout
          defaultSidebarCollapsed
          slots={{
            appTitle: CustomAppTitle,
            toolbarActions: CustomSelectCompany,
          }}
        >
          <PageContainer slots={{ header: CustomPageHeaderComponent }}>
            {children}
          </PageContainer>
        </DashboardLayout>
      </DashboardProvider>
    </AuthProvider>
  );
}
