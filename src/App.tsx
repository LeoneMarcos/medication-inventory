import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { useInventory } from './hooks/useInventory';
import { Button } from './components/ui/Button';
import { Modal } from './components/ui/Modal';
import { DashboardStats } from './components/domain/DashboardStats';
import { InventoryTable } from './components/domain/InventoryTable';
import { MedicationForm } from './components/domain/MedicationForm';
import type { Medication } from './types';

function BrandMark({ className }: { className?: string }) {
  return <img src="/pharivo-mark.png" alt="" aria-hidden="true" className={className} />;
}

const Pill = BrandMark;

function App() {
  const { medications, addMedication, updateMedication, deleteMedication, addQuantity, removeQuantity } = useInventory();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | undefined>();
  const [deletingMedicationId, setDeletingMedicationId] = useState<string>();
  const deletingMedication = medications.find(({ id }) => id === deletingMedicationId);
  const closeModal = () => { setCreateOpen(false); setEditingMedication(undefined); };
  const saveMedication = (data: Omit<Medication, 'id'>) => {
    if (editingMedication) updateMedication(editingMedication.id, data); else addMedication(data);
    closeModal();
  };
  const requestDelete = (id: string) => setDeletingMedicationId(id);
  const closeDeleteModal = () => setDeletingMedicationId(undefined);
  const confirmDelete = () => { if (deletingMedicationId) deleteMedication(deletingMedicationId); closeDeleteModal(); };
  return <div className="min-h-screen font-sans text-slate-900 pb-20">
    <header className="bg-white/45 backdrop-blur-2xl border-b border-white/70 sticky top-0 z-40 shadow-[0_1px_0_rgba(49,93,142,0.08)]"><div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between"><div className="flex items-center gap-3"><div className="bg-gradient-to-br from-blue-600 via-brand-500 to-cyan-400 p-2.5 rounded-2xl text-white shadow-lg shadow-brand-500/25"><Pill className="h-7 w-7" /></div><div><h1 className="font-display text-xl font-extrabold text-slate-800">Pharivo</h1><p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Inventory management</p></div></div><Button onClick={() => setCreateOpen(true)} icon={PlusCircle} className="shadow-lg shadow-brand-500/20">Add medication</Button></div></header>
    <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-10"><section className="animate-rise"><div className="mb-6"><h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-800">Dashboard</h2><p className="text-sm text-slate-500 font-medium mt-1">Medication inventory health at a glance</p></div><DashboardStats medications={medications} /></section><section className="space-y-6 animate-rise" style={{ animationDelay: '100ms' }}><div className="flex items-center gap-2"><div className="h-1 w-8 rounded-full bg-gradient-to-r from-brand-500 to-cyan-400" /><h3 className="font-display font-extrabold text-slate-700 tracking-tight">INVENTORY</h3></div><InventoryTable medications={medications} onAddQuantity={addQuantity} onRemoveQuantity={removeQuantity} onEdit={setEditingMedication} onDelete={requestDelete} /></section></main>
    <Modal isOpen={isCreateOpen || Boolean(editingMedication)} onClose={closeModal} title={editingMedication ? 'Edit medication' : 'Add medication'}><MedicationForm initialMedication={editingMedication} onSubmit={saveMedication} /></Modal>
    <Modal isOpen={Boolean(deletingMedication)} onClose={closeDeleteModal} title="Delete medication?" description="This action cannot be undone."><div className="flex justify-center"><Button type="button" variant="primary" onClick={confirmDelete}>Delete medication</Button></div></Modal>
  </div>;
}
export default App;
