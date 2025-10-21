import { useState, useEffect } from "react";
import { useGlobalFilters } from "@/contexts/GlobalFiltersContext";
import GlobalFilters from "@/components/GlobalFilters";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ComparativosProps {
  rubricas: string[];
}

interface Movement {
  data: string;
  rubrica: string;
  valor: number;
}

export default function Comparativos({ rubricas }: ComparativosProps) {
  const { selectedRubricas, startDate, endDate, compareMode } = useGlobalFilters();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovements();
  }, [selectedRubricas, startDate, endDate, compareMode]);

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

  // Agrupar por mês e rubrica
  const monthlyData = movements.reduce((acc: Record<string, Record<string, number>>, m) => {
    const date = new Date(m.data);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!acc[monthKey]) {
      acc[monthKey] = {};
    }

    acc[monthKey][m.rubrica] = (acc[monthKey][m.rubrica] || 0) + m.valor;
    return acc;
  }, {});

  // Preparar dados para comparação
  const chartData = Object.entries(monthlyData)
    .sort()
    .map(([month, data]) => ({
      month: new Date(month + "-01").toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      ...data,
    }));

  // Calcular top rubricas por período
  const rubricaTotals = movements.reduce((acc: Record<string, number>, m) => {
    acc[m.rubrica] = (acc[m.rubrica] || 0) + m.valor;
    return acc;
  }, {});

  const topRubricas = Object.entries(rubricaTotals)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <GlobalFilters rubricas={rubricas} />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Comparativos</h1>
          <p className="text-slate-400">Análise comparativa entre períodos (MoM/YoY)</p>
        </div>

        {/* Gráfico Comparativo por Rubrica */}
        <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-6">Comparação por Rubrica</h2>
          <ResponsiveContainer width="100%" height={400}>
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

        {/* Top Rubricas */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-xl font-bold text-white mb-6">Top 10 Rubricas no Período</h2>
          <div className="space-y-4">
            {topRubricas.map(([rubrica, total], idx) => {
              const percentage = (Math.abs(total) / Math.abs(topRubricas[0][1])) * 100;
              return (
                <div key={rubrica}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 font-medium">{idx + 1}. {rubrica}</span>
                    <span className={`font-bold ${total < 0 ? "text-red-400" : "text-green-400"}`}>
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(total)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${total < 0 ? "bg-red-500" : "bg-green-500"}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

