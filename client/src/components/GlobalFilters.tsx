import { useGlobalFilters } from "@/contexts/GlobalFiltersContext";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

interface GlobalFiltersProps {
  rubricas?: string[];
}

export default function GlobalFilters({ rubricas: initialRubricas = [] }: GlobalFiltersProps) {
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
  const [rubricas, setRubricas] = useState<string[]>(initialRubricas);
  const [loadingRubricas, setLoadingRubricas] = useState(false);

  // Fetch rubricas from Supabase if not provided
  useEffect(() => {
    if (initialRubricas.length > 0) {
      setRubricas(initialRubricas);
      return;
    }

    const fetchRubricas = async () => {
      setLoadingRubricas(true);
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ozupsbdusywukrteefqc.supabase.co";
        const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || "";

        if (!supabaseUrl || !supabaseKey) {
          console.warn("Supabase credentials not found");
          setLoadingRubricas(false);
          return;
        }

        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase
          .from("dmovimentacoes")
          .select("rubrica")
          .order("rubrica", { ascending: true });

        if (error) {
          console.error("Error fetching rubricas:", error);
          setLoadingRubricas(false);
          return;
        }

        const uniqueRubricas = Array.from(
          new Set((data || []).map((m: any) => m.rubrica).filter(Boolean))
        ).sort();
        
        setRubricas(uniqueRubricas as string[]);
      } catch (error) {
        console.error("Error fetching rubricas:", error);
      } finally {
        setLoadingRubricas(false);
      }
    };

    fetchRubricas();
  }, [initialRubricas]);

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
                {loadingRubricas ? (
                  <div className="text-slate-400 text-sm p-4">Carregando rubricas...</div>
                ) : (
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
                    {rubricas.length === 0 ? (
                      <div className="text-slate-400 text-sm p-2">Nenhuma rubrica encontrada</div>
                    ) : (
                      rubricas.map((rubrica) => (
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
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Período */}
          <div className="flex items-center gap-2">
            <label className="text-slate-300 font-medium">Período:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500"
            />
            <span className="text-slate-300">até</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Agrupar */}
          <div className="flex items-center gap-2">
            <label className="text-slate-300 font-medium">Agrupar:</label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as "month" | "quarter" | "year")}
              className="px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500"
            >
              <option value="month">Mês</option>
              <option value="quarter">Trimestre</option>
              <option value="year">Ano</option>
            </select>
          </div>

          {/* Comparar */}
          <div className="flex items-center gap-2">
            <label className="text-slate-300 font-medium">Comparar:</label>
            <select
              value={compareMode}
              onChange={(e) => setCompareMode(e.target.value as any)}
              className="px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500"
            >
              <option value="none">Nenhum</option>
              <option value="previous">vs. Período Anterior</option>
              <option value="year">vs. Mesmo Período (Ano Anterior)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

