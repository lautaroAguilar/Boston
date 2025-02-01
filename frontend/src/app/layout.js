import "./globals.css"
import { Geist, Geist_Mono } from "next/font/google";

import { AuthProvider } from "@/contexts/auth";
import LocalizationWrapper from "../components/LocalizationWrapper";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

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
    <AuthProvider>
      <LocalizationWrapper>
        <html lang="en">
          <body className={`${geistSans.variable} ${geistMono.variable}`}>
            {children}
          </body>
        </html>
      </LocalizationWrapper>
    </AuthProvider>
  );
}
