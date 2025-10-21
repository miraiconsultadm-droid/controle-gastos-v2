import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirecionar para a página de detalhes
    setLocation("/detalhes");
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
          M
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Controle de Gastos</h1>
        <p className="text-slate-400">Carregando...</p>
      </div>
    </div>
  );
}

