import { useState } from 'react';
import type { Medicamento } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Trash2, ArrowDownCircle, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { cn } from '../../lib/utils';

interface InventoryTableProps {
  medicamentos: Medicamento[];
  onDarBaixa: (id: string, qtd: number) => void;
  onRemover: (id: string) => void;
}

export function InventoryTable({ medicamentos, onDarBaixa, onRemover }: InventoryTableProps) {
  const [busca, setBusca] = useState('');

  const filtrados = medicamentos.filter(m =>
    m.nome.toLowerCase().includes(busca.toLowerCase()) ||
    m.lote.toLowerCase().includes(busca.toLowerCase())
  );

  const getStatusRow = (m: Medicamento) => {
    const today = new Date();
    const validade = new Date(m.validade);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    // Reset time for fair date comparison (optional but good)
    today.setHours(0,0,0,0);
    validade.setHours(0,0,0,0);

    const isVencido = validade < today;
    const isProximoVencimento = validade <= thirtyDaysFromNow;
    const isEstoqueBaixo = m.quantidade <= m.quantidadeMinima;

    if (isVencido || isProximoVencimento) return 'bg-red-50 hover:bg-red-100';
    if (isEstoqueBaixo) return 'bg-yellow-50 hover:bg-yellow-100';
    return '';
  };

  return (
    <Card className="w-full border-none shadow-premium lg:shadow-2xl overflow-hidden">
      <CardHeader className="border-b border-slate-50 bg-slate-50/30 px-4 md:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="space-y-1">
             <CardTitle className="text-2xl">Inventário</CardTitle>
             <p className="text-sm text-slate-500 font-medium">Controle total de lotes e movimentações</p>
           </div>
           <div className="relative w-full md:w-80 group">
             <Search className="absolute left-3.5 top-3 h-5 w-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
             <Input
               placeholder="Buscar medicamento ou lote..."
               className="pl-11 h-11 bg-white border-slate-200 rounded-xl focus:ring-brand-500 transition-all shadow-sm"
               value={busca}
               onChange={(e) => setBusca(e.target.value)}
             />
           </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] bg-slate-50/50">
              <tr>
                <th className="px-6 lg:px-8 py-5">Medicamento</th>
                <th className="px-6 lg:px-8 py-5">Identificação</th>
                <th className="px-6 lg:px-8 py-5 text-center">Disponibilidade</th>
                <th className="px-6 lg:px-8 py-5">Validade</th>
                <th className="px-6 lg:px-8 py-5 text-right">Ações de Controle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtrados.map((item) => (
                <tr key={item.id} className={cn("transition-all duration-200 hover:bg-slate-50/50 group", getStatusRow(item))}>
                  <td className="px-6 lg:px-8 py-5">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-xs ring-1 ring-brand-100 shrink-0">
                        {item.nome.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 text-base truncate">{item.nome}</div>
                        <div className="text-xs text-slate-400 font-medium truncate">{item.fabricante}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 lg:px-8 py-5">
                    <span className="font-mono text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200 whitespace-nowrap">
                       {item.lote}
                    </span>
                  </td>
                  <td className="px-6 lg:px-8 py-5 text-center">
                     <span className={cn(
                       "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ring-1 whitespace-nowrap",
                       item.quantidade <= item.quantidadeMinima 
                        ? "bg-amber-50 text-amber-700 ring-amber-100" 
                        : "bg-emerald-50 text-emerald-700 ring-emerald-100"
                     )}>
                       {item.quantidade} unidades
                     </span>
                  </td>
                  <td className="px-6 lg:px-8 py-5">
                    <div className="flex items-center font-semibold text-slate-600 whitespace-nowrap">
                      {new Date(item.validade).toLocaleDateString('pt-BR')}
                      {(new Date(item.validade) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) && (
                        <span className="ml-2 flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" title="Vencimento Próximo" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 lg:px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button size="sm" variant="secondary" onClick={() => onDarBaixa(item.id, 1)} className="h-9 w-9 p-0" title="Retirar do Estoque">
                        <ArrowDownCircle className="h-4.5 w-4.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-9 w-9 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50" onClick={() => onRemover(item.id)} title="Excluir Registro">
                        <Trash2 className="h-4.5 w-4.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-slate-100">
          {filtrados.map((item) => (
            <div key={item.id} className={cn("p-4 space-y-4", getStatusRow(item))}>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-xs ring-1 ring-brand-100 shrink-0">
                    {item.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 text-base leading-tight truncate">{item.nome}</h4>
                    <p className="text-xs text-slate-400 font-medium truncate">{item.fabricante}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="secondary" onClick={() => onDarBaixa(item.id, 1)} className="h-10 w-10 p-0 rounded-lg shadow-sm">
                    <ArrowDownCircle className="h-5 w-5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onRemover(item.id)} className="h-10 w-10 p-0 text-rose-500 rounded-lg">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Identificação</p>
                  <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200 inline-block">
                    {item.lote}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Disponibilidade</p>
                  <span className={cn(
                    "inline-flex items-center text-xs font-bold",
                    item.quantidade <= item.quantidadeMinima ? "text-amber-600" : "text-emerald-600"
                  )}>
                    {item.quantidade} unidades
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Validade</p>
                  <div className="flex items-center font-semibold text-slate-600 text-xs">
                    {new Date(item.validade).toLocaleDateString('pt-BR')}
                    {(new Date(item.validade) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) && (
                      <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filtrados.length === 0 && (
          <div className="px-6 py-20 text-center">
            <div className="flex flex-col items-center justify-center text-slate-400 max-w-sm mx-auto">
              <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 opacity-20" />
              </div>
              <p className="font-bold text-slate-800 text-lg">Nenhum registro encontrado</p>
              <p className="text-sm text-slate-500 mt-1 font-medium">Tente ajustar seus termos de busca ou cadastrar um novo item.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
