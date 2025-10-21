import { useState, useEffect } from "react";
import { useGlobalFilters } from "@/contexts/GlobalFiltersContext";
import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";

interface Movement {
  data: string;
  rubrica: string;
  valor: number;
}

export default function Dashboard() {
  const { selectedMonths, selectedYears } = useGlobalFilters();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovements();
  }, [selectedMonths, selectedYears]);

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

      let filtered = data || [];

      // Filtrar por mês e ano selecionados
      if (selectedMonths.length > 0 || selectedYears.length > 0) {
        filtered = filtered.filter((m: any) => {
          const date = new Date(m.data);
          const month = date.getMonth() + 1;
          const year = date.getFullYear();

          const monthMatch = selectedMonths.length === 0 || selectedMonths.includes(month);
          const yearMatch = selectedYears.length === 0 || selectedYears.includes(year);

          return monthMatch && yearMatch;
        });
      }

      setMovements(filtered);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular receita, despesa e saldo
  // Despesa: rubricas que começam com 2
  // Receita: rubricas que NÃO começam com 2
  const receita = movements
    .filter((m) => !m.rubrica?.startsWith("2"))
    .reduce((sum, m) => sum + m.valor, 0);

  const despesa = movements
    .filter((m) => m.rubrica?.startsWith("2"))
    .reduce((sum, m) => sum + m.valor, 0);

  const saldo = receita + despesa;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-6">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Resumo Financeiro</h1>
          <p className="text-slate-400">Análise completa dos seus gastos e receitas</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Receita */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-2">Receita</p>
                <p className="text-3xl font-bold text-green-400">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(receita)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-400" size={24} />
              </div>
            </div>
          </Card>

          {/* Despesa */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-2">Despesa</p>
                <p className="text-3xl font-bold text-red-400">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(despesa)}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
                <TrendingDown className="text-red-400" size={24} />
              </div>
            </div>
          </Card>

          {/* Saldo */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-2">Saldo</p>
                <p className={`text-3xl font-bold ${saldo >= 0 ? "text-blue-400" : "text-red-400"}`}>
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(saldo)}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${saldo >= 0 ? "bg-blue-600/20" : "bg-red-600/20"}`}>
                <DollarSign className={saldo >= 0 ? "text-blue-400" : "text-red-400"} size={24} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

