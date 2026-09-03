import { useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Edit3, Search, Trash2 } from 'lucide-react';
import { filterMedications } from '../../lib/inventory';
import { getMedicationCategories } from '../../lib/medications';
import type { Medication, MedicationStatus } from '../../types';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

interface InventoryTableProps {
  medications: Medication[];
  onAddQuantity: (id: string, amount: number) => void;
  onRemoveQuantity: (id: string, amount: number) => void;
  onEdit: (medication: Medication) => void;
  onDelete: (id: string) => void;
}

const statusStyles: Record<MedicationStatus, string> = {
  healthy: 'bg-brand-500/85 text-white ring-white/70 border border-white/65 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_4px_10px_rgba(14,165,233,0.16)]',
  'low stock': 'bg-brand-500/85 text-white ring-white/70 border border-white/65 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_4px_10px_rgba(14,165,233,0.16)]',
  'expiring soon': 'bg-brand-500/85 text-white ring-white/70 border border-white/65 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_4px_10px_rgba(14,165,233,0.16)]',
  expired: 'bg-brand-500/85 text-white ring-white/70 border border-white/65 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_4px_10px_rgba(14,165,233,0.16)]',
};

export function InventoryTable({ medications, onAddQuantity, onRemoveQuantity, onEdit, onDelete }: InventoryTableProps) {
  const [query, setQuery] = useState('');
  const [movement, setMovement] = useState<{ medication: Medication; type: 'add' | 'remove' }>();
  const [amount, setAmount] = useState('1');
  const filteredMedications = filterMedications(medications, query);
  const emptyStateHint = query.trim() ? 'Try a different search term.' : 'Add your first medication to start tracking inventory.';
  const closeMovement = () => { setMovement(undefined); setAmount('1'); };
  const submitMovement = (event: React.FormEvent) => {
    event.preventDefault();
    const value = Number(amount);
    if (!movement || !Number.isInteger(value) || value <= 0) return;
    try {
      if (movement.type === 'add') onAddQuantity(movement.medication.id, value);
      else onRemoveQuantity(movement.medication.id, value);
      closeMovement();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to update stock.');
    }
  };
  return <Card className="w-full overflow-hidden"><CardHeader className="border-b border-white/75 bg-white/28 px-5 md:px-8 py-7"><div className="flex flex-col md:flex-row md:items-center justify-between gap-5"><div><CardTitle>Medication inventory</CardTitle><p className="text-sm text-slate-600 font-medium mt-1">Track batches, expiration dates and stock movements</p></div><div className="relative w-full md:w-80 group"><Search className="absolute left-3.5 top-3 h-5 w-5 text-slate-500 group-focus-within:text-brand-500 transition-colors" /><Input aria-label="Search medications" placeholder="Search name, batch or manufacturer..." className="pl-11 h-11 bg-white/35 border-white/90 focus:bg-white/75 focus:shadow-md transition-all" value={query} onChange={(event) => setQuery(event.target.value)} /></div></div></CardHeader>
    <CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="text-[10px] font-black text-slate-600 uppercase tracking-[0.14em] bg-white/18"><tr><th className="px-6 py-4 border-t-2 border-brand-500">Medication</th><th className="px-6 py-4 border-t-2 border-brand-500">Batch</th><th className="px-6 py-4 border-t-2 border-brand-500">Stock</th><th className="px-6 py-4 border-t-2 border-brand-500">Expiration</th><th className="px-6 py-4 border-t-2 border-brand-500">Status</th><th className="px-6 py-4 text-right border-t-2 border-brand-500">Actions</th></tr></thead><tbody className="divide-y divide-white/55">{filteredMedications.map((medication) => { const statuses = getMedicationCategories(medication); return <tr key={medication.id} className="bg-white/18 hover:bg-white/42 transition-colors"><td className="px-6 py-5"><div><div className="font-bold text-slate-800">{medication.name}</div><div className="text-xs text-slate-500">{medication.manufacturer}</div></div></td><td className="px-6 py-5 font-mono text-xs text-slate-600">{medication.batch}</td><td className="px-6 py-5 font-bold text-slate-800">{medication.quantity} units <span className="block text-xs font-normal text-slate-500">min. {medication.minimumStock}</span></td><td className="px-6 py-5 whitespace-nowrap text-slate-700">{new Date(medication.expirationDate + 'T00:00:00').toLocaleDateString('en-US')}</td><td className="px-6 py-5"><div className="flex flex-wrap gap-2">{statuses.map((status) => <span key={status} className={'inline-flex px-3 py-1.5 rounded-full text-xs font-bold ring-1 ' + statusStyles[status]}>{status}</span>)}</div></td><td className="px-6 py-5"><div className="flex justify-end gap-1"><Button size="sm" variant="secondary" aria-label={'Add stock to ' + medication.name} title="Add stock" onClick={() => setMovement({ medication, type: 'add' })}><ArrowUpCircle className="h-4 w-4" /></Button><Button size="sm" variant="secondary" aria-label={'Remove stock from ' + medication.name} title="Remove stock" onClick={() => setMovement({ medication, type: 'remove' })}><ArrowDownCircle className="h-4 w-4" /></Button><Button size="sm" variant="ghost" aria-label={'Edit ' + medication.name} title="Edit medication" onClick={() => onEdit(medication)}><Edit3 className="h-4 w-4" /></Button><Button size="sm" variant="ghost" aria-label={'Delete ' + medication.name} title="Delete medication" className="text-slate-900 hover:text-slate-700" onClick={() => onDelete(medication.id)}><Trash2 className="h-4 w-4" /></Button></div></td></tr>; })}</tbody></table></div>{filteredMedications.length === 0 && <div className="px-6 py-20 text-center text-slate-500"><div className="h-14 w-14 mx-auto mb-4 rounded-2xl bg-white/35 flex items-center justify-center"><Search className="h-7 w-7 text-slate-400" /></div><p className="font-display font-extrabold text-slate-800">No medications found</p><p className="text-sm mt-1">{emptyStateHint}</p></div>}</CardContent>
    <Modal isOpen={Boolean(movement)} onClose={closeMovement} title={movement?.type === 'add' ? 'Add stock' : 'Remove stock'}><form onSubmit={submitMovement} className="space-y-5"><p className="text-slate-600">Update stock for <strong>{movement?.medication.name}</strong>.</p><Input id="movement-amount" label="Quantity" type="number" min="1" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} required /><div className="flex justify-end gap-3"><Button type="button" variant="ghost" onClick={closeMovement}>Cancel</Button><Button type="submit">{movement?.type === 'add' ? 'Add units' : 'Remove units'}</Button></div></form></Modal>
  </Card>;
}
