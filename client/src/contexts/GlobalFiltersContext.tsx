import React, { createContext, useContext, useState } from "react";

interface GlobalFiltersContextType {
  selectedMonths: number[]; // 1-12
  setSelectedMonths: (months: number[]) => void;
  selectedYears: number[];
  setSelectedYears: (years: number[]) => void;
}

const GlobalFiltersContext = createContext<GlobalFiltersContextType | undefined>(undefined);

export function GlobalFiltersProvider({ children }: { children: React.ReactNode }) {
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);

  return (
    <GlobalFiltersContext.Provider
      value={{
        selectedMonths,
        setSelectedMonths,
        selectedYears,
        setSelectedYears,
      }}
    >
      {children}
    </GlobalFiltersContext.Provider>
  );
}

export function useGlobalFilters() {
  const context = useContext(GlobalFiltersContext);
  if (!context) {
    throw new Error("useGlobalFilters must be used within GlobalFiltersProvider");
  }
  return context;
}

