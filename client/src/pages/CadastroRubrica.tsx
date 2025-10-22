import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

interface Rubrica {
  id?: string;
  nome: string;
  descricao?: string;
  tipo?: string;
}

export default function CadastroRubrica() {
  const [formData, setFormData] = useState<Rubrica>({
    nome: "",
    descricao: "",
    tipo: "despesa",
  });

  const [rubricas, setRubricas] = useState<Rubrica[]>([]);
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
      ).sort()
        .map((nome) => ({ nome }));

      setRubricas(uniqueRubricas as Rubrica[]);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (!formData.nome.trim()) {
        setMessage("Erro: Nome da rubrica é obrigatório");
        setLoading(false);
        return;
      }

      // Adicionar à lista local (já que não temos uma tabela de rubricas)
      if (!rubricas.find((r) => r.nome.toLowerCase() === formData.nome.toLowerCase())) {
        setRubricas([...rubricas, formData]);
        setMessage("✅ Rubrica adicionada com sucesso!");
        setFormData({
          nome: "",
          descricao: "",
          tipo: "despesa",
        });

        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Erro: Esta rubrica já existe");
      }
    } catch (error) {
      setMessage(`Erro: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (index: number) => {
    setRubricas(rubricas.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold">
            M
          </div>
          <h1 className="text-3xl font-bold text-white">Gerenciar Rubricas</h1>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Card */}
          <Card className="bg-slate-900 border-slate-700 shadow-2xl">
            <div className="p-8">
              <h2 className="text-xl font-bold text-white mb-6">Nova Rubrica</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Nome da Rubrica *</label>
                  <Input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Alimentação"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tipo</label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:border-purple-500"
                  >
                    <option value="receita">Receita</option>
                    <option value="despesa">Despesa</option>
                    <option value="transferencia">Transferência</option>
                  </select>
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Descrição</label>
                  <textarea
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    placeholder="Descrição da rubrica..."
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:border-purple-500"
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
                  {loading ? "Adicionando..." : "Adicionar Rubrica"}
                </Button>
              </form>
            </div>
          </Card>

          {/* Rubricas List */}
          <Card className="bg-slate-900 border-slate-700 shadow-2xl">
            <div className="p-8">
              <h2 className="text-xl font-bold text-white mb-6">Rubricas Existentes</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {rubricas.length > 0 ? (
                  rubricas.map((rubrica, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-white font-medium">{rubrica.nome}</p>
                        {rubrica.descricao && (
                          <p className="text-slate-400 text-sm mt-1">{rubrica.descricao}</p>
                        )}
                        {rubrica.tipo && (
                          <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                            rubrica.tipo === "receita"
                              ? "bg-green-900 text-green-200"
                              : rubrica.tipo === "despesa"
                              ? "bg-red-900 text-red-200"
                              : "bg-blue-900 text-blue-200"
                          }`}>
                            {rubrica.tipo}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(index)}
                        className="ml-4 p-2 text-red-400 hover:bg-red-900/20 rounded transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-8">Nenhuma rubrica cadastrada</p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

