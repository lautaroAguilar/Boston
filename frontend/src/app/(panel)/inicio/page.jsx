"use client";
import React, { useEffect } from "react";
import Typography from "@mui/material/Typography";
import { Stack } from "@mui/material";
import { useCompany } from "@/contexts/companies";

export default function DashboardHomePage() {
  const { fetchCompaniesInfo } = useCompany();
  useEffect(() => {
    fetchCompaniesInfo();
  }, []);
  return (
    <Stack>
      <Typography>Welcome to home page in the dashboard!</Typography>
    </Stack>
  );
}
