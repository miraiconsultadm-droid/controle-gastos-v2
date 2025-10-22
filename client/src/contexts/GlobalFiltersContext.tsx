import React, { createContext, useContext, useState, useEffect } from "react";

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

const STORAGE_KEY = "globalFilters";

const getDefaultStartDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear(), 0, 1);
  return date.toISOString().split("T")[0];
};

const getDefaultEndDate = () => {
  return new Date().toISOString().split("T")[0];
};

export function GlobalFiltersProvider({ children }: { children: React.ReactNode }) {
  const [selectedRubricas, setSelectedRubricas] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(getDefaultEndDate());
  const [groupBy, setGroupBy] = useState<"month" | "quarter" | "year">("month");
  const [compareMode, setCompareMode] = useState<"mom" | "yoy" | "none">("none");
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar filtros do localStorage ao montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const filters = JSON.parse(stored);
        setSelectedRubricas(filters.selectedRubricas || []);
        setStartDate(filters.startDate || getDefaultStartDate());
        setEndDate(filters.endDate || getDefaultEndDate());
        setGroupBy(filters.groupBy || "month");
        setCompareMode(filters.compareMode || "none");
      }
    } catch (error) {
      console.error("Erro ao carregar filtros do localStorage:", error);
    }
    setIsLoaded(true);
  }, []);

  // Salvar filtros no localStorage quando mudarem
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            selectedRubricas,
            startDate,
            endDate,
            groupBy,
            compareMode,
          })
        );
      } catch (error) {
        console.error("Erro ao salvar filtros no localStorage:", error);
      }
    }
  }, [selectedRubricas, startDate, endDate, groupBy, compareMode, isLoaded]);

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

