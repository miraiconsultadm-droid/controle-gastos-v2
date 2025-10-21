import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingDown, Scale, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Movement {
  data: string;
  rubrica: string;
  valor: number;
  banco?: string;
  pagador?: string;
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

export default function Dashboard() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedRubricas, setSelectedRubricas] = useState<string[]>([]);
  const [rubricas, setRubricas] = useState<string[]>([]);
  const [showMonthsDropdown, setShowMonthsDropdown] = useState(false);
  const [showYearsDropdown, setShowYearsDropdown] = useState(false);
  const [showRubricasDropdown, setShowRubricasDropdown] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

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

  const filteredMovements = movements.filter((m) => {
    const date = parseDate(m.data);
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = String(date.getUTCFullYear());

    const monthMatch = selectedMonths.length === 0 || selectedMonths.includes(month);
    const yearMatch = selectedYears.length === 0 || selectedYears.includes(year);
    const rubricaMatch = selectedRubricas.length === 0 || selectedRubricas.includes(m.rubrica);

    return monthMatch && yearMatch && rubricaMatch;
  });

  // Calcular KPIs
  const receitas = filteredMovements.filter((m) => m.valor > 0);
  const despesas = filteredMovements.filter((m) => m.valor < 0);
  const totalReceita = receitas.reduce((sum, m) => sum + m.valor, 0);
  const totalDespesa = despesas.reduce((sum, m) => sum + m.valor, 0);
  const saldo = totalReceita + totalDespesa;

  // Preparar dados para gráfico
  const chartData = months.map((month) => {
    const monthMovements = filteredMovements.filter((m) => {
      const date = parseDate(m.data);
      const m_month = String(date.getUTCMonth() + 1).padStart(2, "0");
      return m_month === month.value;
    });

    const receita = monthMovements
      .filter((m) => m.valor > 0)
      .reduce((sum, m) => sum + m.valor, 0);
    const despesa = Math.abs(
      monthMovements.filter((m) => m.valor < 0).reduce((sum, m) => sum + m.valor, 0)
    );

    return {
      name: month.label.substring(0, 3),
      receita: parseFloat(receita.toFixed(2)),
      despesa: parseFloat(despesa.toFixed(2)),
    };
  });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold">
            M
          </div>
          <h1 className="text-3xl font-bold text-white">Resumo Financeiro</h1>
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

      {/* KPI Cards */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Receita */}
          <Card className="bg-gradient-to-br from-green-900 to-green-800 border-green-700 shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-200 text-sm font-medium">Receita</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    R$ {totalReceita.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <DollarSign size={40} className="text-green-400 opacity-50" />
              </div>
            </div>
          </Card>

          {/* Despesa */}
          <Card className="bg-gradient-to-br from-red-900 to-red-800 border-red-700 shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-200 text-sm font-medium">Despesa</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    R$ {Math.abs(totalDespesa).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <TrendingDown size={40} className="text-red-400 opacity-50" />
              </div>
            </div>
          </Card>

          {/* Saldo */}
          <Card className={`bg-gradient-to-br ${saldo >= 0 ? "from-blue-900 to-blue-800 border-blue-700" : "from-orange-900 to-orange-800 border-orange-700"} shadow-lg`}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${saldo >= 0 ? "text-blue-200" : "text-orange-200"} text-sm font-medium`}>Saldo</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    R$ {saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <Scale size={40} className={`${saldo >= 0 ? "text-blue-400" : "text-orange-400"} opacity-50`} />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Gráfico */}
      <div className="max-w-7xl mx-auto">
        <Card className="bg-slate-900 border-slate-700 shadow-2xl">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-6">Evolução Mensal</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Legend />
                <Bar dataKey="receita" fill="#22c55e" name="Receita" />
                <Bar dataKey="despesa" fill="#ef4444" name="Despesa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

