import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Detalhes from "./pages/Detalhes";
import Dashboard from "./pages/Dashboard";
import CadastroMovimentacao from "./pages/CadastroMovimentacao";
import CadastroRubrica from "./pages/CadastroRubrica";
import { BarChart3, Plus, Tag } from "lucide-react";

function Navigation() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-slate-900 border-b border-slate-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2 text-white font-bold text-lg hover:text-purple-400 transition-colors">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                M
              </div>
              Controle de Gastos
            </a>
            <div className="flex items-center gap-4">
              <a
                href="/"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive("/")
                    ? "bg-purple-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <BarChart3 size={18} />
                Resumo
              </a>
              <a
                href="/detalhes"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive("/detalhes")
                    ? "bg-purple-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <BarChart3 size={18} />
                Detalhes
              </a>
              <a
                href="/cadastro-movimentacao"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive("/cadastro-movimentacao")
                    ? "bg-purple-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Plus size={18} />
                Nova Movimentacao
              </a>
              <a
                href="/cadastro-rubrica"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive("/cadastro-rubrica")
                    ? "bg-purple-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
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
  return (
    <>
      <Navigation />
      <Switch>
        <Route path={"/"} component={Dashboard} />
        <Route path={"/detalhes"} component={Detalhes} />
        <Route path={"/cadastro-movimentacao"} component={CadastroMovimentacao} />
        <Route path={"/cadastro-rubrica"} component={CadastroRubrica} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

