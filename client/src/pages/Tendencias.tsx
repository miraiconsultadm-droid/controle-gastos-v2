import { useState, useEffect } from "react";
import { useGlobalFilters } from "@/contexts/GlobalFiltersContext";
import GlobalFilters from "@/components/GlobalFilters";
import { Card } from "@/components/ui/card";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface TendenciasProps {
  rubricas: string[];
}

interface Movement {
  data: string;
  rubrica: string;
  valor: number;
}

export default function Tendencias({ rubricas }: TendenciasProps) {
  const { selectedRubricas, startDate, endDate } = useGlobalFilters();
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

  // Calcular média móvel (3 meses)
  const chartData = Object.entries(monthlyData)
    .sort()
    .map(([month, data], idx, arr) => {
      const current = Object.values(data).reduce((a, b) => a + b, 0);
      const prev1 = idx > 0 ? Object.values(arr[idx - 1][1]).reduce((a, b) => a + b, 0) : current;
      const prev2 = idx > 1 ? Object.values(arr[idx - 2][1]).reduce((a, b) => a + b, 0) : current;

      const mediaMovel = (current + prev1 + prev2) / 3;

      return {
        month: new Date(month + "-01").toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
        total: current,
        mediaMovel: Math.round(mediaMovel * 100) / 100,
        ...data,
      };
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <GlobalFilters rubricas={rubricas} />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Tendências</h1>
          <p className="text-slate-400">Análise de evolução e tendências ao longo do tempo</p>
        </div>

        {/* Gráfico de Tendências */}
        <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-6">Evolução Mensal com Média Móvel (3 meses)</h2>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
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
              <Bar dataKey="total" fill="#3b82f6" name="Total do Mês" />
              <Line type="monotone" dataKey="mediaMovel" stroke="#ec4899" name="Média Móvel (3m)" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        {/* Detalhes por Rubrica */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {selectedRubricas.length > 0
            ? selectedRubricas.map((rubrica) => (
                <Card key={rubrica} className="bg-slate-800 border-slate-700 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">{rubrica}</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <ComposedChart data={chartData}>
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
                      <Bar dataKey={rubrica} fill="#3b82f6" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Card>
              ))
            : rubricas.slice(0, 2).map((rubrica) => (
                <Card key={rubrica} className="bg-slate-800 border-slate-700 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">{rubrica}</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <ComposedChart data={chartData}>
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
                      <Bar dataKey={rubrica} fill="#3b82f6" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Card>
              ))}
        </div>
      </div>
    </div>
  );
}

