import React from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { NextAppProvider } from "@toolpad/core/nextjs";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import NAVIGATION from "@/components/Items";
import { Box, LinearProgress } from "@mui/material";
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
