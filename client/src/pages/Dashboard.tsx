import { useState, useEffect } from "react";
import { useGlobalFilters } from "@/contexts/GlobalFiltersContext";
import GlobalFilters from "@/components/GlobalFilters";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from "recharts";
import { DollarSign, TrendingUp, Zap, Target } from "lucide-react";

interface DashboardProps {
  rubricas: string[];
}

interface Movement {
  data: string;
  rubrica: string;
  valor: number;
}

export default function Dashboard({ rubricas }: DashboardProps) {
  const { selectedRubricas, startDate, endDate, groupBy, compareMode } = useGlobalFilters();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovements();
  }, [selectedRubricas, startDate, endDate]);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ozupsbdusywukrteefqc.supabase.co";
      const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || "";

      if (!supabaseUrl || !supabaseKey) return;

      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, supabaseKey);

      let query = supabase.from("dmovimentacoes").select("data, rubrica, valor");

      if (startDate) query = query.gte("data", startDate);
      if (endDate) query = query.lte("data", endDate);

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching movements:", error);
        return;
      }

      let filtered = data || [];
      if (selectedRubricas.length > 0) {
        filtered = filtered.filter((m: any) => selectedRubricas.includes(m.rubrica));
      }

      setMovements(filtered);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular KPIs
  const totalGastos = movements.reduce((sum, m) => sum + m.valor, 0);
  const qtdLancamentos = movements.length;
  const ticketMedio = qtdLancamentos > 0 ? totalGastos / qtdLancamentos : 0;

  // Agrupar por rubrica
  const rubricaTotals = movements.reduce((acc: Record<string, number>, m) => {
    acc[m.rubrica] = (acc[m.rubrica] || 0) + m.valor;
    return acc;
  }, {});

  const topRubrica = Object.entries(rubricaTotals).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];

  // Agrupar por mês para gráfico
  const monthlyData = movements.reduce((acc: Record<string, Record<string, number>>, m) => {
    const date = new Date(m.data);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!acc[monthKey]) {
      acc[monthKey] = {};
    }

    acc[monthKey][m.rubrica] = (acc[monthKey][m.rubrica] || 0) + m.valor;
    return acc;
  }, {});

  const chartData = Object.entries(monthlyData)
    .sort()
    .map(([month, data]) => ({
      month: new Date(month + "-01").toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      ...data,
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <GlobalFilters rubricas={rubricas} />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Resumo Financeiro</h1>
          <p className="text-slate-400">Análise completa dos seus gastos e receitas</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Gastos */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-2">Total no Período</p>
                <p className="text-3xl font-bold text-white">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalGastos)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <DollarSign className="text-blue-400" size={24} />
              </div>
            </div>
          </Card>

          {/* Qtd Lançamentos */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-2">Lançamentos</p>
                <p className="text-3xl font-bold text-white">{qtdLancamentos}</p>
              </div>
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <Zap className="text-purple-400" size={24} />
              </div>
            </div>
          </Card>

          {/* Ticket Médio */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-2">Ticket Médio</p>
                <p className="text-3xl font-bold text-white">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(ticketMedio)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-400" size={24} />
              </div>
            </div>
          </Card>

          {/* Top Rubrica */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-2">Top Rubrica</p>
                <p className="text-2xl font-bold text-white">{topRubrica?.[0] || "-"}</p>
                <p className="text-slate-400 text-sm mt-1">
                  {topRubrica ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(topRubrica[1]) : "N/A"}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center">
                <Target className="text-orange-400" size={24} />
              </div>
            </div>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Evolução Mensal */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Evolução Mensal</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                  labelStyle={{ color: "#e2e8f0" }}
                  formatter={(value: any) =>
                    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
                  }
                />
                <Legend />
                {rubricas.slice(0, 5).map((rubrica, idx) => (
                  <Bar key={rubrica} dataKey={rubrica} fill={["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"][idx]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Top 10 Rubricas */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Top 10 Rubricas</h2>
            <div className="space-y-3">
              {Object.entries(rubricaTotals)
                .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
                .slice(0, 10)
                .map(([rubrica, total]) => (
                  <div key={rubrica} className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">{rubrica}</span>
                    <span className={`font-bold ${total < 0 ? "text-red-400" : "text-green-400"}`}>
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(total)}
                    </span>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

