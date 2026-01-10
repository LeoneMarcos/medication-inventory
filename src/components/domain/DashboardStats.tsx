import { Card, CardContent } from '../ui/Card';
import { AlertTriangle, Package, AlertCircle } from 'lucide-react';
import type { Medicamento } from '../../types';

interface DashboardStatsProps {
  medicamentos: Medicamento[];
}

export function DashboardStats({ medicamentos }: DashboardStatsProps) {
  const totalItens = medicamentos.length;
  const estoqueBaixo = medicamentos.filter(m => m.quantidade <= m.quantidadeMinima).length;
  
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const vencimentoProximo = medicamentos.filter(m => {
    const validade = new Date(m.validade);
    return validade <= thirtyDaysFromNow;
  }).length;

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="relative overflow-hidden border-none group transition-all duration-300 hover:shadow-xl">
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
          <Package className="h-28 w-28" />
        </div>
        <CardContent className="flex items-center p-8 space-x-6 relative z-10">
          <div className="p-4 bg-brand-50 rounded-2xl text-brand-600 shadow-inner group-hover:bg-brand-100 transition-colors">
            <Package className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total em Catálogo</p>
            <h4 className="text-4xl font-black text-slate-800 mt-1">{totalItens}</h4>
          </div>
        </CardContent>
        <div className="h-1.5 w-full bg-brand-500/20 absolute bottom-0 left-0" />
      </Card>

      <Card className="relative overflow-hidden border-none group transition-all duration-300 hover:shadow-xl">
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
          <AlertTriangle className="h-28 w-28" />
        </div>
        <CardContent className="flex items-center p-8 space-x-6 relative z-10">
          <div className="p-4 bg-amber-50 rounded-2xl text-amber-600 shadow-inner group-hover:bg-amber-100 transition-colors">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Estoque Crítico</p>
            <h4 className="text-4xl font-black text-slate-800 mt-1">{estoqueBaixo}</h4>
          </div>
        </CardContent>
        <div className="h-1.5 w-full bg-amber-500/30 absolute bottom-0 left-0" />
      </Card>

      <Card className="relative overflow-hidden border-none group transition-all duration-300 hover:shadow-xl">
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
          <AlertCircle className="h-28 w-28" />
        </div>
        <CardContent className="flex items-center p-8 space-x-6 relative z-10">
          <div className="p-4 bg-rose-50 rounded-2xl text-rose-600 shadow-inner group-hover:bg-rose-100 transition-colors">
             <AlertCircle className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Vencimento em 30d</p>
            <h4 className="text-4xl font-black text-slate-800 mt-1">{vencimentoProximo}</h4>
          </div>
        </CardContent>
        <div className="h-1.5 w-full bg-rose-500/30 absolute bottom-0 left-0" />
      </Card>
    </div>
  );
}
