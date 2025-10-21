import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Download, Search, ChevronDown } from "lucide-react";

interface Movement {
  id?: string;
  data: string;
  rubrica: string;
  banco?: string;
  pagador?: string;
  valor: number;
  cod_rubrica?: string;
  descricao?: string;
  parcelas?: number;
}

const months = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

const years = Array.from({ length: 10 }, (_, i) => ({
  value: String(2020 + i),
  label: String(2020 + i),
}));

// Helper function to parse date string (YYYY-MM-DD)
function parseDate(dateString: string): Date {
  if (!dateString || dateString.trim() === "") {
    return new Date();
  }
  const date = new Date(dateString + "T00:00:00Z");
  if (isNaN(date.getTime())) {
    return new Date();
  }
  return date;
}

// Helper function to format date
function formatDate(dateString: string): string {
  if (!dateString || dateString.trim() === "") {
    return "--/--/----";
  }
  const date = parseDate(dateString);
  if (isNaN(date.getTime())) {
    return "--/--/----";
  }
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

export default function Detalhes() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [filteredMovements, setFilteredMovements] = useState<Movement[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [loading, setLoading] = useState(true);

  // Filtros
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedRubricas, setSelectedRubricas] = useState<string[]>([]);
  const [rubricas, setRubricas] = useState<string[]>([]);

  // Dropdowns
  const [showMonthsDropdown, setShowMonthsDropdown] = useState(false);
  const [showYearsDropdown, setShowYearsDropdown] = useState(false);
  const [showRubricasDropdown, setShowRubricasDropdown] = useState(false);

  // Fetch movimentacoes from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ozupsbdusywukrteefqc.supabase.co";
        const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || "";

        if (!supabaseUrl || !supabaseKey) {
          console.error("Supabase credentials not configured");
          return;
        }

        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase
          .from("dmovimentacoes")
          .select("*")
          .order("data", { ascending: false });

        if (error) {
          console.error("Error fetching data:", error);
          return;
        }

        setMovements(data || []);

        // Extract unique rubricas
        const uniqueRubricas = Array.from(
          new Set((data || []).map((m: any) => m.rubrica).filter(Boolean))
        ).sort();
        setRubricas(uniqueRubricas as string[]);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = movements.filter((m) => {
      const date = parseDate(m.data);
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const year = String(date.getUTCFullYear());

      const monthMatch = selectedMonths.length === 0 || selectedMonths.includes(month);
      const yearMatch = selectedYears.length === 0 || selectedYears.includes(year);
      const rubricaMatch = selectedRubricas.length === 0 || selectedRubricas.includes(m.rubrica);

      return monthMatch && yearMatch && rubricaMatch;
    });

    // Apply search filter
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (m) =>
          (m.rubrica && m.rubrica.toLowerCase().includes(term)) ||
          (m.banco && m.banco.toLowerCase().includes(term)) ||
          (m.pagador && m.pagador.toLowerCase().includes(term)) ||
          (m.descricao && m.descricao.toLowerCase().includes(term)) ||
          (m.valor && m.valor.toString().includes(term))
      );
    }

    // Apply sort
    filtered = filtered.sort((a, b) => {
      const dateA = parseDate(a.data).getTime();
      const dateB = parseDate(b.data).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    setFilteredMovements(filtered);
  }, [movements, searchTerm, sortOrder, selectedMonths, selectedYears, selectedRubricas]);

  const getMonthLabels = () => {
    if (selectedMonths.length === 0) return "Todos os meses";
    if (selectedMonths.length === 1) {
      const month = months.find((m) => m.value === selectedMonths[0]);
      return month?.label || "Mês";
    }
    return `${selectedMonths.length} meses`;
  };

  const getYearLabels = () => {
    if (selectedYears.length === 0) return "Todos os anos";
    if (selectedYears.length === 1) return selectedYears[0];
    return `${selectedYears.length} anos`;
  };

  const getRubricaLabels = () => {
    if (selectedRubricas.length === 0) return `Rubricas (0)`;
    return `Rubricas (${selectedRubricas.length})`;
  };

  const exportToCSV = () => {
    const headers = ["Data", "Rubrica", "Banco", "Pagador", "Valor", "Parcelas"];
    const rows = filteredMovements.map((m) => [
      formatDate(m.data),
      m.rubrica,
      m.banco || "",
      m.pagador || "",
      m.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
      m.parcelas || 1,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, "0")}-${String(now.getMonth() + 1).padStart(2, "0")}-${now.getFullYear()}`;
    link.download = `movimentacoes_${dateStr}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold">
            M
          </div>
          <h1 className="text-3xl font-bold text-white">Detalhes das Movimentações</h1>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Months */}
          <div className="relative">
            <button
              onClick={() => setShowMonthsDropdown(!showMonthsDropdown)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-2 transition-colors"
            >
              {getMonthLabels()}
              <ChevronDown size={16} />
            </button>

            {showMonthsDropdown && (
              <div className="absolute top-full mt-2 left-0 bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-4 z-50 min-w-64">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => setSelectedMonths(months.map((m) => m.value))}
                      className="flex-1 px-3 py-2 text-slate-300 hover:bg-slate-700 rounded text-sm bg-slate-700 hover:bg-slate-600 transition-colors"
                    >
                      ✓ Todos
                    </button>
                    <button
                      onClick={() => setSelectedMonths([])}
                      className="flex-1 px-3 py-2 text-slate-300 hover:bg-slate-700 rounded text-sm bg-slate-700 hover:bg-slate-600 transition-colors"
                    >
                      ✕ Nenhum
                    </button>
                  </div>
                  {months.map((month) => (
                    <label key={month.value} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-700 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedMonths.includes(month.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMonths([...selectedMonths, month.value]);
                          } else {
                            setSelectedMonths(selectedMonths.filter((m) => m !== month.value));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-slate-300 text-sm">{month.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Years */}
          <div className="relative">
            <button
              onClick={() => setShowYearsDropdown(!showYearsDropdown)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-2 transition-colors"
            >
              {getYearLabels()}
              <ChevronDown size={16} />
            </button>

            {showYearsDropdown && (
              <div className="absolute top-full mt-2 left-0 bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-4 z-50 min-w-64">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => setSelectedYears(years.map((y) => y.value))}
                      className="flex-1 px-3 py-2 text-slate-300 hover:bg-slate-700 rounded text-sm bg-slate-700 hover:bg-slate-600 transition-colors"
                    >
                      ✓ Todos
                    </button>
                    <button
                      onClick={() => setSelectedYears([])}
                      className="flex-1 px-3 py-2 text-slate-300 hover:bg-slate-700 rounded text-sm bg-slate-700 hover:bg-slate-600 transition-colors"
                    >
                      ✕ Nenhum
                    </button>
                  </div>
                  {years.map((year) => (
                    <label key={year.value} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-700 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedYears.includes(year.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedYears([...selectedYears, year.value]);
                          } else {
                            setSelectedYears(selectedYears.filter((y) => y !== year.value));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-slate-300 text-sm">{year.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Rubricas */}
          <div className="relative">
            <button
              onClick={() => setShowRubricasDropdown(!showRubricasDropdown)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-2 transition-colors"
            >
              {getRubricaLabels()}
              <ChevronDown size={16} />
            </button>

            {showRubricasDropdown && (
              <div className="absolute top-full mt-2 left-0 bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-4 z-50 min-w-64">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => setSelectedRubricas(rubricas)}
                      className="flex-1 px-3 py-2 text-slate-300 hover:bg-slate-700 rounded text-sm bg-slate-700 hover:bg-slate-600 transition-colors"
                    >
                      ✓ Todos
                    </button>
                    <button
                      onClick={() => setSelectedRubricas([])}
                      className="flex-1 px-3 py-2 text-slate-300 hover:bg-slate-700 rounded text-sm bg-slate-700 hover:bg-slate-600 transition-colors"
                    >
                      ✕ Nenhum
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
        </div>
      </div>

      {/* Search and Export */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-3 text-slate-500" />
            <Input
              placeholder="Buscar por rubrica, banco, pagador ou valor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-500"
            />
          </div>
          <Button
            onClick={exportToCSV}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white flex items-center gap-2"
          >
            <Download size={18} />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto">
        <Card className="bg-slate-900 border-slate-700 shadow-2xl">
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left px-4 py-3 text-slate-300 font-semibold">
                      <button
                        onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                        className="hover:text-white transition-colors"
                      >
                        Data {sortOrder === "desc" ? "↓" : "↑"}
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 text-slate-300 font-semibold">Rubrica</th>
                    <th className="text-left px-4 py-3 text-slate-300 font-semibold">Banco</th>
                    <th className="text-left px-4 py-3 text-slate-300 font-semibold">Pagador</th>
                    <th className="text-right px-4 py-3 text-slate-300 font-semibold">Valor</th>
                    <th className="text-center px-4 py-3 text-slate-300 font-semibold">Parcelas</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        Carregando...
                      </td>
                    </tr>
                  ) : filteredMovements.length > 0 ? (
                    filteredMovements.map((movement, index) => (
                      <tr
                        key={index}
                        className="border-b border-slate-700 hover:bg-slate-800 transition-colors"
                      >
                        <td className="px-4 py-3 text-slate-300">
                          {formatDate(movement.data)}
                        </td>
                        <td className="px-4 py-3 text-slate-300">{movement.rubrica}</td>
                        <td className="px-4 py-3 text-slate-300">{movement.banco || "-"}</td>
                        <td className="px-4 py-3 text-slate-300">{movement.pagador || "-"}</td>
                        <td className="px-4 py-3 text-right text-white font-semibold">
                          R$ {Number(movement.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-300">
                          {movement.parcelas || 1}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        Nenhuma movimentação encontrada para os filtros selecionados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-slate-400 text-sm">
              Total de movimentações: <span className="text-white font-semibold">{filteredMovements.length}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

