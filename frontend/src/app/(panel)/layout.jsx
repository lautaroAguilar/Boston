"use client";
import { Stack, Typography, Tooltip } from "@mui/material";
import { DashboardLayout, PageContainer } from "@toolpad/core";
import { CheckCircleRounded } from "@mui/icons-material";
import { AuthProvider } from "@/contexts/auth";

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

export default function DashboardRootLayout({ children }) {
  return (
    <AuthProvider>
      <DashboardLayout
        slots={{
          appTitle: CustomAppTitle,
        }}
      >
        <PageContainer>{children}</PageContainer>
      </DashboardLayout>
    </AuthProvider>
  );
}
