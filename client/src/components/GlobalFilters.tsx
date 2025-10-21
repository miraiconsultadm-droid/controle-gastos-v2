import { useGlobalFilters } from "@/contexts/GlobalFiltersContext";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const MONTHS = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

const YEARS = [2023, 2024, 2025, 2026];

export default function GlobalFilters() {
  const { selectedMonths, setSelectedMonths, selectedYears, setSelectedYears } = useGlobalFilters();
  const [showMonthsDropdown, setShowMonthsDropdown] = useState(false);
  const [showYearsDropdown, setShowYearsDropdown] = useState(false);

  const toggleMonth = (month: number) => {
    setSelectedMonths(
      selectedMonths.includes(month)
        ? selectedMonths.filter((m) => m !== month)
        : [...selectedMonths, month].sort((a, b) => a - b)
    );
  };

  const toggleYear = (year: number) => {
    setSelectedYears(
      selectedYears.includes(year)
        ? selectedYears.filter((y) => y !== year)
        : [...selectedYears, year].sort((a, b) => a - b)
    );
  };

  const selectAllMonths = () => {
    setSelectedMonths(MONTHS.map((m) => m.value));
  };

  const clearAllMonths = () => {
    setSelectedMonths([]);
  };

  const selectAllYears = () => {
    setSelectedYears(YEARS);
  };

  const clearAllYears = () => {
    setSelectedYears([]);
  };

  const getMonthsLabel = () => {
    if (selectedMonths.length === 0) return "Selecione meses";
    if (selectedMonths.length === 12) return "Todos os meses";
    return `${selectedMonths.length} mês(es)`;
  };

  const getYearsLabel = () => {
    if (selectedYears.length === 0) return "Selecione anos";
    if (selectedYears.length === YEARS.length) return "Todos os anos";
    return selectedYears.join(", ");
  };

  return (
    <div className="bg-slate-900 border-b border-slate-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex gap-4 items-center flex-wrap">
          {/* Meses */}
          <div className="relative">
            <button
              onClick={() => setShowMonthsDropdown(!showMonthsDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white hover:bg-slate-700 transition-colors"
            >
              {getMonthsLabel()}
              <ChevronDown size={18} />
            </button>

            {showMonthsDropdown && (
              <div className="absolute top-full left-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-4 w-64 z-50">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {MONTHS.map((month) => (
                    <label key={month.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedMonths.includes(month.value)}
                        onChange={() => toggleMonth(month.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-slate-300">{month.label}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2 border-t border-slate-700 pt-4">
                  <button
                    onClick={selectAllMonths}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition-colors"
                  >
                    Todos
                  </button>
                  <button
                    onClick={clearAllMonths}
                    className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors"
                  >
                    Limpar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Anos */}
          <div className="relative">
            <button
              onClick={() => setShowYearsDropdown(!showYearsDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white hover:bg-slate-700 transition-colors"
            >
              {getYearsLabel()}
              <ChevronDown size={18} />
            </button>

            {showYearsDropdown && (
              <div className="absolute top-full left-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-4 w-48 z-50">
                <div className="space-y-2 mb-4">
                  {YEARS.map((year) => (
                    <label key={year} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedYears.includes(year)}
                        onChange={() => toggleYear(year)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-slate-300">{year}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2 border-t border-slate-700 pt-4">
                  <button
                    onClick={selectAllYears}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition-colors"
                  >
                    Todos
                  </button>
                  <button
                    onClick={clearAllYears}
                    className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors"
                  >
                    Limpar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

