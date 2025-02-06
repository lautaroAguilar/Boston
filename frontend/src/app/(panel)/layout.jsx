"use client";
import { useEffect } from "react";
import {
  Stack,
  Typography,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { DashboardLayout, PageContainer, ThemeSwitcher } from "@toolpad/core";
import { CheckCircleRounded } from "@mui/icons-material";
import { AuthProvider } from "@/contexts/auth";
import { useCompany } from "@/contexts/companies";
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
export default function DashboardRootLayout({ children }) {
  return (
    <AuthProvider>
      <DashboardLayout
        slots={{
          appTitle: CustomAppTitle,
          toolbarActions: CustomSelectCompany,
        }}
      >
        <PageContainer>{children}</PageContainer>
      </DashboardLayout>
    </AuthProvider>
  );
}
