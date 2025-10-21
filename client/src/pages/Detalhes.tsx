import { useState, useEffect } from "react";
import { useGlobalFilters } from "@/contexts/GlobalFiltersContext";
import GlobalFilters from "@/components/GlobalFilters";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, ChevronUp, ChevronDown } from "lucide-react";

interface DetalhesProps {
  rubricas: string[];
}

interface Movement {
  id?: string;
  data: string;
  rubrica: string;
  banco?: string;
  pagador?: string;
  valor: number;
  descricao?: string;
  parcelas?: number;
}

type SortField = "data" | "rubrica" | "valor";
type SortOrder = "asc" | "desc";

export default function Detalhes({ rubricas }: DetalhesProps) {
  const { selectedRubricas, startDate, endDate } = useGlobalFilters();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [filteredMovements, setFilteredMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("data");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  useEffect(() => {
    fetchMovements();
  }, [selectedRubricas, startDate, endDate]);

  useEffect(() => {
    filterAndSortMovements();
  }, [movements, searchTerm, sortField, sortOrder, selectedRubricas, startDate, endDate]);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ozupsbdusywukrteefqc.supabase.co";
      const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || "";

      if (!supabaseUrl || !supabaseKey) return;

      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, supabaseKey);

      let query = supabase.from("dmovimentacoes").select("*");

      if (startDate) query = query.gte("data", startDate);
      if (endDate) query = query.lte("data", endDate);

      const { data, error } = await query;

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

  const filterAndSortMovements = () => {
    let filtered = movements;

    // Filtrar por rubricas selecionadas
    if (selectedRubricas.length > 0) {
      filtered = filtered.filter((m) => selectedRubricas.includes(m.rubrica));
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.rubrica?.toLowerCase().includes(term) ||
          m.banco?.toLowerCase().includes(term) ||
          m.pagador?.toLowerCase().includes(term) ||
          m.descricao?.toLowerCase().includes(term) ||
          m.valor.toString().includes(term)
      );
    }

    // Ordenar
    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === "data") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredMovements(filtered);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const exportCSV = () => {
    const headers = ["Data", "Rubrica", "Banco", "Pagador", "Valor", "Parcelas", "Descrição"];
    const rows = filteredMovements.map((m) => [
      m.data,
      m.rubrica,
      m.banco || "-",
      m.pagador || "-",
      m.valor,
      m.parcelas || 1,
      m.descricao || "-",
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `detalhes_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <div className="w-4 h-4" />;
    return sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <GlobalFilters rubricas={rubricas} />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Detalhes das Movimentações</h1>
          <p className="text-slate-400">Visualize e analise todas as suas transações</p>
        </div>

        {/* Filtros e Ações */}
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Buscar por rubrica, banco, pagador ou valor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-slate-800 border-slate-700 text-white"
          />
          <Button onClick={exportCSV} className="bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2">
            <Download size={18} />
            Exportar CSV
          </Button>
        </div>

        {/* Tabela */}
        <Card className="bg-slate-800 border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-700 border-b border-slate-600">
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("data")}
                      className="flex items-center gap-2 text-slate-300 font-medium hover:text-white transition-colors"
                    >
                      Data
                      <SortIcon field="data" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("rubrica")}
                      className="flex items-center gap-2 text-slate-300 font-medium hover:text-white transition-colors"
                    >
                      Rubrica
                      <SortIcon field="rubrica" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-slate-300 font-medium">Banco</th>
                  <th className="px-6 py-4 text-left text-slate-300 font-medium">Pagador</th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("valor")}
                      className="flex items-center gap-2 text-slate-300 font-medium hover:text-white transition-colors"
                    >
                      Valor
                      <SortIcon field="valor" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-slate-300 font-medium">Parcelas</th>
                  <th className="px-6 py-4 text-left text-slate-300 font-medium">Descrição</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.map((movement, idx) => (
                  <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 text-slate-300">
                      {movement.data ? new Date(movement.data).toLocaleDateString("pt-BR") : "-"}
                    </td>
                    <td className="px-6 py-4 text-white font-medium">{movement.rubrica || "-"}</td>
                    <td className="px-6 py-4 text-slate-300">{movement.banco || "-"}</td>
                    <td className="px-6 py-4 text-slate-300">{movement.pagador || "-"}</td>
                    <td className={`px-6 py-4 font-bold ${movement.valor < 0 ? "text-red-400" : "text-green-400"}`}>
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(movement.valor)}
                    </td>
                    <td className="px-6 py-4 text-slate-300">{movement.parcelas || 1}</td>
                    <td className="px-6 py-4 text-slate-300 text-sm">{movement.descricao || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredMovements.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              <p>Nenhuma movimentação encontrada</p>
            </div>
          )}
        </Card>

        {/* Resumo */}
        <div className="mt-6 text-slate-400 text-sm">
          <p>
            Total de registros: <span className="text-white font-bold">{filteredMovements.length}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

