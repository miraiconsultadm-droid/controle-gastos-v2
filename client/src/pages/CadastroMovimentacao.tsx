import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, X } from "lucide-react";

interface Movement {
  data: string;
  rubrica: string;
  banco?: string;
  pagador?: string;
  valor: number;
  descricao?: string;
  parcelas?: number;
}

const BANCOS = [
  "CRÉDITO ITAÚ",
  "CRÉDITO INTER",
  "CRÉDITO NUBANK",
  "DÉBITO ITAÚ",
  "DÉBITO INTER",
  "DÉBITO NUBANK",
  "INTER PJ",
  "BTG PJ",
  "DINHEIRO",
  "OUTROS",
];

const PAGADORES = ["DIEGO", "MARINA", "MIRAI", "MD CASTRO", "OUTROS"];

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
  const [filteredRubricas, setFilteredRubricas] = useState<string[]>([]);
  const [showRubricaDropdown, setShowRubricaDropdown] = useState(false);
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
      setFilteredRubricas(uniqueRubricas as string[]);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleRubricaSearch = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      rubrica: value,
    }));

    if (value.trim() === "") {
      setFilteredRubricas(rubricas);
    } else {
      const filtered = rubricas.filter((r) =>
        r.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredRubricas(filtered);
    }
    setShowRubricaDropdown(true);
  };

  const handleSelectRubrica = (rubrica: string) => {
    setFormData((prev) => ({
      ...prev,
      rubrica,
    }));
    setShowRubricaDropdown(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "valor") {
      // Allow negative values by accepting the string and converting
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? 0 : parseFloat(value),
      }));
    } else if (name === "parcelas") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? 1 : parseFloat(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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

              {/* Rubrica com Autocomplete */}
              <div className="relative">
                <label className="block text-sm font-medium text-slate-300 mb-2">Rubrica *</label>
                <div className="relative">
                  <Input
                    type="text"
                    name="rubrica"
                    value={formData.rubrica}
                    onChange={(e) => handleRubricaSearch(e.target.value)}
                    onFocus={() => setShowRubricaDropdown(true)}
                    placeholder="Digite para buscar rubrica..."
                    required
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                  {showRubricaDropdown && filteredRubricas.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {filteredRubricas.map((rubrica) => (
                        <button
                          key={rubrica}
                          type="button"
                          onClick={() => handleSelectRubrica(rubrica)}
                          className="w-full text-left px-4 py-2 hover:bg-slate-700 text-slate-200 first:rounded-t-lg last:rounded-b-lg"
                        >
                          {rubrica}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Valor */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Valor *</label>
                <div className="relative">
                  <Input
                    type="text"
                    name="valor"
                    value={formData.valor === 0 ? '' : formData.valor}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      
                      // Empty input
                      if (value === '') {
                        setFormData((prev) => ({
                          ...prev,
                          valor: 0,
                        }));
                        return;
                      }
                      
                      // Just a minus sign
                      if (value === '-') {
                        setFormData((prev) => ({
                          ...prev,
                          valor: 0,
                        }));
                        return;
                      }
                      
                      // Validate number format: optional minus, digits, optional decimal point and digits
                      const numberRegex = /^-?\d*\.?\d*$/;
                      if (numberRegex.test(value)) {
                        const numValue = parseFloat(value);
                        if (!isNaN(numValue)) {
                          setFormData((prev) => ({
                            ...prev,
                            valor: numValue,
                          }));
                        }
                      }
                    }}
                    onBlur={(e) => {
                      // Format the value when leaving the field
                      const value = e.target.value.trim();
                      if (value && value !== '-') {
                        const numValue = parseFloat(value);
                        if (!isNaN(numValue)) {
                          setFormData((prev) => ({
                            ...prev,
                            valor: numValue,
                          }));
                        }
                      }
                    }}
                    required
                    placeholder="-150.50 ou 100.00"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">Positivo para receita, negativo para despesa (ex: -150.50)</p>
              </div>

              {/* Banco */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Banco</label>
                <select
                  name="banco"
                  value={formData.banco}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:border-purple-500"
                >
                  <option value="">Selecione um banco</option>
                  {BANCOS.map((banco) => (
                    <option key={banco} value={banco}>
                      {banco}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pagador */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Pagador</label>
                <select
                  name="pagador"
                  value={formData.pagador}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:border-purple-500"
                >
                  <option value="">Selecione um pagador</option>
                  {PAGADORES.map((pagador) => (
                    <option key={pagador} value={pagador}>
                      {pagador}
                    </option>
                  ))}
                </select>
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

