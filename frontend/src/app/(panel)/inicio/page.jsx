"use client";
import React, { useEffect } from "react";
import Typography from "@mui/material/Typography";
import { Stack } from "@mui/material";
import { useDashboard } from "@/contexts/dashboard";

export default function DashboardHomePage() {
  const { setToolbarExportAction, setToolbarButtonAction } = useDashboard();
  useEffect(() => {
    setToolbarExportAction(null)
    setToolbarButtonAction(null)
  }, [setToolbarExportAction, setToolbarButtonAction])
  return (
    <Stack>
      <Typography>Welcome to home page in the dashboard!</Typography>
    </Stack>
  );
}
