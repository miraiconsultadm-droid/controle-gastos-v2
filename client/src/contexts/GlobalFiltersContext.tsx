import React, { createContext, useContext, useState } from "react";

interface GlobalFiltersContextType {
  selectedRubricas: string[];
  setSelectedRubricas: (rubricas: string[]) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  groupBy: "month" | "quarter" | "year";
  setGroupBy: (groupBy: "month" | "quarter" | "year") => void;
  compareMode: "mom" | "yoy" | "none";
  setCompareMode: (mode: "mom" | "yoy" | "none") => void;
}

const GlobalFiltersContext = createContext<GlobalFiltersContextType | undefined>(undefined);

export function GlobalFiltersProvider({ children }: { children: React.ReactNode }) {
  const [selectedRubricas, setSelectedRubricas] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [groupBy, setGroupBy] = useState<"month" | "quarter" | "year">("month");
  const [compareMode, setCompareMode] = useState<"mom" | "yoy" | "none">("none");

  return (
    <GlobalFiltersContext.Provider
      value={{
        selectedRubricas,
        setSelectedRubricas,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        groupBy,
        setGroupBy,
        compareMode,
        setCompareMode,
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

