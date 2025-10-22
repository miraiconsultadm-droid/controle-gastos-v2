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

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export default function Comparativos({ rubricas }: ComparativosProps) {
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

  // Agrupar por mês e ano
  const monthlyByYear: Record<number, Record<number, number>> = {};

  movements.forEach((m) => {
    const date = new Date(m.data);
    const year = date.getFullYear();
    const month = date.getMonth();

    if (!monthlyByYear[year]) {
      monthlyByYear[year] = {};
    }

    monthlyByYear[year][month] = (monthlyByYear[year][month] || 0) + m.valor;
  });

  // Preparar dados para o gráfico (visão mensal lado a lado)
  const chartData = MONTHS.map((month, monthIdx) => {
    const data: any = { month };

    Object.entries(monthlyByYear).forEach(([year, months]) => {
      data[year] = months[monthIdx] || 0;
    });

    return data;
  });

  // Obter anos únicos
  const yearsInData = Object.keys(monthlyByYear)
    .map(Number)
    .sort();

  const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <GlobalFilters rubricas={rubricas} />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Comparativos</h1>
          <p className="text-slate-400">Análise comparativa entre períodos (Ano a Ano)</p>
        </div>

        {/* Gráfico Comparativo Ano a Ano */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <h2 className="text-xl font-bold text-white mb-6">Comparação Mensal por Ano</h2>
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
              {yearsInData.map((year, idx) => (
                <Bar key={year} dataKey={year.toString()} fill={colors[idx % colors.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

