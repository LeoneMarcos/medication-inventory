import { useState } from 'react';
import { PlusCircle, Pill } from 'lucide-react';
import { useEstoque } from './hooks/useEstoque';
import { Button } from './components/ui/Button';
import { Modal } from './components/ui/Modal';
import { DashboardStats } from './components/domain/DashboardStats';
import { InventoryTable } from './components/domain/InventoryTable';
import { MedicationForm } from './components/domain/MedicationForm';
import type { Medicamento } from './types';

function App() {
  const { medicamentos, adicionar, remover, darBaixa } = useEstoque();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddMedicamento = (data: Omit<Medicamento, 'id'>) => {
    adicionar(data);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 pb-20">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 transition-all duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="bg-gradient-to-br from-blue-600 to-cyan-400 p-2 sm:p-2.5 rounded-xl sm:rounded-[1rem] text-white shadow-lg group cursor-pointer hover:rotate-6 transition-transform">
              <Pill className="h-6 w-6 sm:h-7 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent flex items-center tracking-tight">
                PharmaTrack
              </h1>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-none mt-1">SISTEMA INTEGRADO</p>
            </div>
          </div>
          <Button onClick={() => setIsModalOpen(true)} icon={PlusCircle} className="hidden sm:inline-flex shadow-brand-500/20 shadow-xl" size="md">
            Novo Medicamento
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="sm:hidden p-0 h-10 w-10 rounded-xl bg-brand-500 text-white shadow-lg shadow-brand-500/20" size="md">
             <PlusCircle className="h-6 w-6" />
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <section>
           <div className="flex items-end justify-between mb-6">
             <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Painel de Controle</h2>
               <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Métricas de performance e segurança</p>
             </div>
             <div className="text-right hidden md:block">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status do Sistema</p>
               <div className="flex items-center justify-end mt-1.5 space-x-1.5 font-bold text-emerald-500 text-xs">
                 <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span>Operacional</span>
               </div>
             </div>
           </div>
           <DashboardStats medicamentos={medicamentos} />
        </section>

        <section className="space-y-6">
          <div className="flex items-center space-x-2">
             <div className="h-1 w-8 bg-brand-500 rounded-full" />
             <h3 className="font-extrabold text-slate-700 tracking-tight">CONTROLE DE ATIVOS</h3>
          </div>
          <InventoryTable
            medicamentos={medicamentos}
            onDarBaixa={darBaixa}
            onRemover={remover}
          />
        </section>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Registro"
      >
        <MedicationForm
          onSubmit={handleAddMedicamento}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

export default App;
