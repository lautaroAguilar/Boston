"use client";
import { Suspense } from "react";
import { AuthProvider } from "@/contexts/auth";
import LocalizationWrapper from "./LocalizationWrapper";

export default function ClientLayout({ children }) {
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}
