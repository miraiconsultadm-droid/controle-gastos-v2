import { useState, useEffect } from "react";
import { useGlobalFilters } from "@/contexts/GlobalFiltersContext";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Movement {
  data: string;
  rubrica: string;
  valor: number;
}

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export default function Comparativos() {
  const { selectedMonths, selectedYears } = useGlobalFilters();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovements();
  }, [selectedMonths, selectedYears]);

  useEffect(() => {
    prepareChartData();
  }, [movements, selectedMonths, selectedYears]);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ozupsbdusywukrteefqc.supabase.co";
      const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || "";

      if (!supabaseUrl || !supabaseKey) return;

      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data, error } = await supabase.from("dmovimentacoes").select("data, rubrica, valor");

      if (error) {
        console.error("Error fetching movements:", error);
        return;
      }

      setMovements(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = () => {
    // Agrupar por mês e ano
    const monthlyData: Record<string, Record<number, number>> = {};

    movements.forEach((m) => {
      const date = new Date(m.data);
      const month = date.getMonth();
      const year = date.getFullYear();

      const monthKey = MONTHS[month];

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {};
      }

      monthlyData[monthKey][year] = (monthlyData[monthKey][year] || 0) + m.valor;
    });

    // Converter para formato do gráfico
    const data = MONTHS.map((month) => {
      const monthData: any = { month };

      if (monthlyData[month]) {
        Object.entries(monthlyData[month]).forEach(([year, value]) => {
          monthData[`${year}`] = value;
        });
      }

      return monthData;
    });

    setChartData(data);
  };

  // Obter anos únicos nos dados
  const yearsInData = Array.from(
    new Set(
      movements.map((m) => {
        const date = new Date(m.data);
        return date.getFullYear();
      })
    )
  ).sort();

  const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-6">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Comparativos</h1>
          <p className="text-slate-400">Análise comparativa entre períodos (Ano a Ano)</p>
        </div>

        {/* Gráfico Comparativo */}
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

