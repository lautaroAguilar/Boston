"use client";
import { Suspense } from "react";
import { AuthProvider } from "@/contexts/auth";
import { CompanyProvider } from "@/contexts/companies";
import LocalizationWrapper from "./LocalizationWrapper";

export default function ClientLayout({ children }) {
  return (
    <AuthProvider>
      <CompanyProvider>
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
      </CompanyProvider>
    </AuthProvider>
  );
}
