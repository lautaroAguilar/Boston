"use client";
import { Suspense } from "react";
import { AuthProvider } from "@/contexts/auth";
import { CompanyProvider } from "@/contexts/companies";
import { DashboardProvider } from "@/contexts/dashboard";
import { StudentProvider } from "@/contexts/students";
import LocalizationWrapper from "./LocalizationWrapper";

export default function ClientLayout({ children }) {
  return (
    <AuthProvider>
      <DashboardProvider>
        <CompanyProvider>
          <StudentProvider>
            <LocalizationWrapper>
              <Suspense
                fallback={
                  <>
                    <p>Cargando...</p>
                  </>
                }
              >
                {children}
              </Suspense>
            </LocalizationWrapper>
          </StudentProvider>
        </CompanyProvider>
      </DashboardProvider>
    </AuthProvider>
  );
}
