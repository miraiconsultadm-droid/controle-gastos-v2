import { useGlobalFilters } from "@/contexts/GlobalFiltersContext";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

interface GlobalFiltersProps {
  rubricas: string[];
}

export default function GlobalFilters({ rubricas }: GlobalFiltersProps) {
  const {
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
  } = useGlobalFilters();

  const [showRubricasDropdown, setShowRubricasDropdown] = useState(false);

  const getRubricaLabel = () => {
    if (selectedRubricas.length === 0) return "Todas as Rubricas";
    if (selectedRubricas.length === 1) return selectedRubricas[0];
    return `${selectedRubricas.length} Rubricas`;
  };

  return (
    <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Rubricas */}
          <div className="relative">
            <button
              onClick={() => setShowRubricasDropdown(!showRubricasDropdown)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center gap-2 transition-colors font-medium"
            >
              {getRubricaLabel()}
              <ChevronDown size={16} />
            </button>

            {showRubricasDropdown && (
              <div className="absolute top-full mt-2 left-0 bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-4 z-50 min-w-80">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => setSelectedRubricas(rubricas)}
                      className="flex-1 px-3 py-2 text-slate-300 hover:bg-slate-700 rounded text-sm bg-slate-700 hover:bg-slate-600 transition-colors"
                    >
                      ✓ Todas
                    </button>
                    <button
                      onClick={() => setSelectedRubricas([])}
                      className="flex-1 px-3 py-2 text-slate-300 hover:bg-slate-700 rounded text-sm bg-slate-700 hover:bg-slate-600 transition-colors"
                    >
                      ✕ Nenhuma
                    </button>
                  </div>
                  {rubricas.map((rubrica) => (
                    <label key={rubrica} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-700 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedRubricas.includes(rubrica)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRubricas([...selectedRubricas, rubrica]);
                          } else {
                            setSelectedRubricas(selectedRubricas.filter((r) => r !== rubrica));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-slate-300 text-sm">{rubrica}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Data Range */}
          <div className="flex gap-2 items-center">
            <label className="text-slate-300 text-sm font-medium">Período:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg text-sm"
            />
            <span className="text-slate-400">até</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg text-sm"
            />
          </div>

          {/* Group By */}
          <div className="flex gap-2 items-center">
            <label className="text-slate-300 text-sm font-medium">Agrupar:</label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as "month" | "quarter" | "year")}
              className="px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg text-sm"
            >
              <option value="month">Mês</option>
              <option value="quarter">Trimestre</option>
              <option value="year">Ano</option>
            </select>
          </div>

          {/* Compare Mode */}
          <div className="flex gap-2 items-center">
            <label className="text-slate-300 text-sm font-medium">Comparar:</label>
            <select
              value={compareMode}
              onChange={(e) => setCompareMode(e.target.value as "mom" | "yoy" | "none")}
              className="px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg text-sm"
            >
              <option value="none">Nenhum</option>
              <option value="mom">vs. Período Anterior</option>
              <option value="yoy">vs. Mesmo Período (Ano Anterior)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

