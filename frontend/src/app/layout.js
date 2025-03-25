import React from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { NextAppProvider } from "@toolpad/core/nextjs";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { Box, LinearProgress } from "@mui/material";
import {
  HomeRounded,
  SchoolRounded,
  GroupRounded,
  Diversity3Rounded,
  CalendarMonthRounded,
  ApartmentRounded,
  AdminPanelSettingsRounded
} from "@mui/icons-material";
import ClientLayout from "@/components/ClientLayout";
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Boston",
  description: "Sistema de gestión de usuarios",
};

export default function RootLayout({ children }) {
  const NAVIGATION = [
    {
      segment: "inicio",
      title: "Inicio",
      icon: <HomeRounded />,
    },
    {
      segment: "estudiantes",
      title: "Estudiantes",
      icon: <SchoolRounded />,
    },
    {
      segment: "docentes",
      title: "Docentes",
      icon: <GroupRounded />,
    },
    {
      segment: "grupos",
      title: "Grupos",
      icon: <Diversity3Rounded />,
    },
    {
      segment: "cronograma",
      title: "Cronograma",
      icon: <CalendarMonthRounded />,
    },
    {
      segment: "empresas",
      title: "Empresas",
      icon: <ApartmentRounded />,
    },
    {
      segment: "usuarios",
      title: "Usuarios",
      icon: <AdminPanelSettingsRounded />,
    },
  ];
  return (
    <Box component={"html"} lang="en" suppressHydrationWarning>
      <Box
        component={"body"}
        className={`${geistSans.variable} ${geistMono.variable}`}
        sx={{
          height: "100dvh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <React.Suspense fallback={<LinearProgress />}>
            <NextAppProvider navigation={NAVIGATION}>
              <ClientLayout>{children}</ClientLayout>
            </NextAppProvider>
          </React.Suspense>
        </AppRouterCacheProvider>
      </Box>
    </Box>
  );
}
