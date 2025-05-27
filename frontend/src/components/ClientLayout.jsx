"use client";
import { Suspense } from "react";
import { AuthProvider } from "@/contexts/auth";
import { CompanyProvider } from "@/contexts/companies";
import { DashboardProvider } from "@/contexts/dashboard";
import { StudentProvider } from "@/contexts/students";
import { TeacherProvider } from "@/contexts/teachers";
import { GroupProvider } from "@/contexts/groups";
import { ScheduleProvider } from "@/contexts/schedules";
import LocalizationWrapper from "./LocalizationWrapper";

export default function ClientLayout({ children }) {
  return (
    <DashboardProvider>
      <AuthProvider>
        <CompanyProvider>
          <StudentProvider>
            <TeacherProvider>
              <GroupProvider>
                <ScheduleProvider>
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
                </ScheduleProvider>
              </GroupProvider>
            </TeacherProvider>
          </StudentProvider>
        </CompanyProvider>
      </AuthProvider>
    </DashboardProvider>
  );
}
