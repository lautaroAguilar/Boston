"use client";
import { createContext, useContext, useState } from "react";

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const [toolbarButtonAction, setToolbarButtonAction] = useState(null);

  return (
    <DashboardContext.Provider
      value={{ toolbarButtonAction, setToolbarButtonAction }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  return useContext(DashboardContext);
}
