"use client";
import { Suspense } from "react";
import { AuthProvider } from "@/contexts/auth";
import { CompanyProvider } from "@/contexts/companies";
import { DashboardProvider } from "@/contexts/dashboard";
import { StudentProvider } from "@/contexts/students";
import { TeacherProvider } from "@/contexts/teachers";
import LocalizationWrapper from "./LocalizationWrapper";

export default function ClientLayout({ children }) {
  return (
    <AuthProvider>
      <DashboardProvider>
        <CompanyProvider>
          <StudentProvider>
            <TeacherProvider>
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
            </TeacherProvider>
          </StudentProvider>
        </CompanyProvider>
      </DashboardProvider>
    </AuthProvider>
  );
}
