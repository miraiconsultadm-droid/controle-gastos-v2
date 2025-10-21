import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { GlobalFiltersProvider } from "./contexts/GlobalFiltersContext";
import Dashboard from "./pages/Dashboard";
import Detalhes from "./pages/Detalhes";
import Tendencias from "./pages/Tendencias";
import Comparativos from "./pages/Comparativos";
import CadastroMovimentacao from "./pages/CadastroMovimentacao";
import CadastroRubrica from "./pages/CadastroRubrica";
import { BarChart3, Plus, Tag, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";

function Navigation() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-3 text-white font-bold text-lg hover:text-blue-400 transition-colors">
              <img src="/logo-mirai.png" alt="MirAI" className="h-10 w-auto" />
              <span>MirAI Financeiro</span>
            </a>
            <div className="flex items-center gap-2">
              <a
                href="/"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive("/")
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-700"
                }`}
              >
                <BarChart3 size={18} />
                Resumo
              </a>
              <a
                href="/tendencias"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive("/tendencias")
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-700"
                }`}
              >
                <TrendingUp size={18} />
                Tendências
              </a>
              <a
                href="/comparativos"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive("/comparativos")
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-700"
                }`}
              >
                <BarChart3 size={18} />
                Comparativos
              </a>
              <a
                href="/detalhes"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive("/detalhes")
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-700"
                }`}
              >
                <BarChart3 size={18} />
                Detalhes
              </a>
              <a
                href="/cadastro-movimentacao"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive("/cadastro-movimentacao")
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-700"
                }`}
              >
                <Plus size={18} />
                Nova Movimentacao
              </a>
              <a
                href="/cadastro-rubrica"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive("/cadastro-rubrica")
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-700"
                }`}
              >
                <Tag size={18} />
                Rubricas
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  const [rubricas, setRubricas] = useState<string[]>([]);

  useEffect(() => {
    const fetchRubricas = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ozupsbdusywukrteefqc.supabase.co";
        const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || "";

        if (!supabaseUrl || !supabaseKey) return;

        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data } = await supabase
          .from("dmovimentacoes")
          .select("rubrica")
          .order("rubrica", { ascending: true });

        const uniqueRubricas = Array.from(
          new Set((data || []).map((m: any) => m.rubrica).filter(Boolean))
        ).sort();
        setRubricas(uniqueRubricas as string[]);
      } catch (error) {
        console.error("Error fetching rubricas:", error);
      }
    };

    fetchRubricas();
  }, []);

  return (
    <GlobalFiltersProvider>
      <>
        <Navigation />
        <Switch>
          <Route path={"/"} component={() => <Dashboard rubricas={rubricas} />} />
          <Route path={"/tendencias"} component={() => <Tendencias rubricas={rubricas} />} />
          <Route path={"/comparativos"} component={() => <Comparativos rubricas={rubricas} />} />
          <Route path={"/detalhes"} component={() => <Detalhes rubricas={rubricas} />} />
          <Route path={"/cadastro-movimentacao"} component={CadastroMovimentacao} />
          <Route path={"/cadastro-rubrica"} component={CadastroRubrica} />
          <Route path={"/404"} component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </>
    </GlobalFiltersProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

