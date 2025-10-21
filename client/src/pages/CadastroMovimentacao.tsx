import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface Movement {
  data: string;
  rubrica: string;
  banco?: string;
  pagador?: string;
  valor: number;
  descricao?: string;
  parcelas?: number;
}

export default function CadastroMovimentacao() {
  const [formData, setFormData] = useState<Movement>({
    data: new Date().toISOString().split("T")[0],
    rubrica: "",
    banco: "",
    pagador: "",
    valor: 0,
    descricao: "",
    parcelas: 1,
  });

  const [rubricas, setRubricas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchRubricas();
  }, []);

  const fetchRubricas = async () => {
    try {
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
        .select("rubrica")
        .order("rubrica", { ascending: true });

      if (error) {
        console.error("Error fetching rubricas:", error);
        return;
      }

      const uniqueRubricas = Array.from(
        new Set((data || []).map((m: any) => m.rubrica).filter(Boolean))
      ).sort();
      setRubricas(uniqueRubricas as string[]);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "valor" || name === "parcelas" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ozupsbdusywukrteefqc.supabase.co";
      const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || "";

      if (!supabaseUrl || !supabaseKey) {
        setMessage("Erro: Credenciais do Supabase não configuradas");
        return;
      }

      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error } = await supabase.from("dmovimentacoes").insert([formData]);

      if (error) {
        setMessage(`Erro ao cadastrar: ${error.message}`);
        return;
      }

      setMessage("✅ Movimentação cadastrada com sucesso!");
      setFormData({
        data: new Date().toISOString().split("T")[0],
        rubrica: "",
        banco: "",
        pagador: "",
        valor: 0,
        descricao: "",
        parcelas: 1,
      });

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(`Erro: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold">
            M
          </div>
          <h1 className="text-3xl font-bold text-white">Cadastrar Movimentação</h1>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto">
        <Card className="bg-slate-900 border-slate-700 shadow-2xl">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Data */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Data *</label>
                <Input
                  type="date"
                  name="data"
                  value={formData.data}
                  onChange={handleChange}
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              {/* Rubrica */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Rubrica *</label>
                <select
                  name="rubrica"
                  value={formData.rubrica}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:border-purple-500"
                >
                  <option value="">Selecione uma rubrica</option>
                  {rubricas.map((rubrica) => (
                    <option key={rubrica} value={rubrica}>
                      {rubrica}
                    </option>
                  ))}
                </select>
              </div>

              {/* Valor */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Valor *</label>
                <Input
                  type="number"
                  name="valor"
                  step="0.01"
                  value={formData.valor}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <p className="text-xs text-slate-400 mt-1">Positivo para receita, negativo para despesa</p>
              </div>

              {/* Banco */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Banco</label>
                <Input
                  type="text"
                  name="banco"
                  value={formData.banco}
                  onChange={handleChange}
                  placeholder="Ex: CARTÃO ITAÚ"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              {/* Pagador */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Pagador</label>
                <Input
                  type="text"
                  name="pagador"
                  value={formData.pagador}
                  onChange={handleChange}
                  placeholder="Ex: DIEGO"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Descrição</label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  placeholder="Descrição adicional..."
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Parcelas */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Parcelas</label>
                <Input
                  type="number"
                  name="parcelas"
                  min="1"
                  value={formData.parcelas}
                  onChange={handleChange}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              {/* Message */}
              {message && (
                <div className={`p-4 rounded-lg text-sm ${message.includes("✅") ? "bg-green-900 text-green-200" : "bg-red-900 text-red-200"}`}>
                  {message}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                {loading ? "Cadastrando..." : "Cadastrar Movimentação"}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}

