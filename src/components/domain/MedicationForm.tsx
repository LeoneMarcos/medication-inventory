import { useRef, useState } from 'react';
import { CalendarDays, Save } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { Medication } from '../../types';

interface MedicationFormProps {
  initialMedication?: Medication;
  onSubmit: (data: Omit<Medication, 'id'>) => void;
}

export function MedicationForm({ initialMedication, onSubmit }: MedicationFormProps) {
  const nativeDatePicker = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: initialMedication?.name ?? '', batch: initialMedication?.batch ?? '',
    quantity: String(initialMedication?.quantity ?? ''), expirationDate: initialMedication?.expirationDate ?? '',
    manufacturer: initialMedication?.manufacturer ?? '', minimumStock: String(initialMedication?.minimumStock ?? ''),
  });
  const [expirationInput, setExpirationInput] = useState(initialMedication?.expirationDate ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const update = (field: keyof typeof formData, value: string) => setFormData((current) => ({ ...current, [field]: value }));
  const updateExpiration = (value: string) => {
    setExpirationInput(value);
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) update('expirationDate', value);
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [day, month, year] = value.split('/');
      update('expirationDate', `${year}-${month}-${day}`);
    }
  };
  const formatExpiration = (value: string) => value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!formData.name.trim()) nextErrors.name = 'Name is required';
    if (!formData.batch.trim()) nextErrors.batch = 'Batch is required';
    if (!formData.quantity || Number(formData.quantity) < 0) nextErrors.quantity = 'Enter a valid quantity';
    if (!formData.expirationDate) nextErrors.expirationDate = 'Expiration date is required';
    if (!formData.minimumStock || Number(formData.minimumStock) < 0) nextErrors.minimumStock = 'Enter a valid minimum stock';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSubmit({ name: formData.name.trim(), batch: formData.batch.trim(), quantity: Number(formData.quantity),
      expirationDate: formData.expirationDate, manufacturer: formData.manufacturer.trim() || 'Unknown', minimumStock: Number(formData.minimumStock) });
  };
  return <form onSubmit={handleSubmit} className="space-y-6">
    <Input id="name" label="Commercial name / active ingredient" placeholder="e.g. Amoxicillin 500mg" value={formData.name} onChange={(e) => update('name', e.target.value)} error={errors.name} required />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Input id="batch" label="Batch number" placeholder="e.g. LT-2025-001" value={formData.batch} onChange={(e) => update('batch', e.target.value)} error={errors.batch} required /><Input id="manufacturer" label="Manufacturer" placeholder="e.g. Pfizer" value={formData.manufacturer} onChange={(e) => update('manufacturer', e.target.value)} /></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Input id="quantity" label={initialMedication ? 'Current stock' : 'Initial stock'} type="number" min="0" value={formData.quantity} onChange={(e) => update('quantity', e.target.value)} error={errors.quantity} required /><Input id="minimumStock" label="Minimum stock" type="number" min="0" value={formData.minimumStock} onChange={(e) => update('minimumStock', e.target.value)} error={errors.minimumStock} required /></div>
    <div className="w-full"><label htmlFor="expirationDate" className="text-sm font-bold text-slate-700 mb-1.5 flex items-center">Expiration date<span className="text-blue-600 ml-1" title="Required field">*</span></label><div className="relative"><Input id="expirationDate" aria-label="Expiration date" placeholder="Select expiration date" value={expirationInput && /^\d{4}-\d{2}-\d{2}$/.test(expirationInput) ? formatExpiration(expirationInput) : expirationInput} onChange={(e) => updateExpiration(e.target.value)} onBlur={() => { if (formData.expirationDate) setExpirationInput(formatExpiration(formData.expirationDate)); }} error={errors.expirationDate} className="pr-12" /><button type="button" aria-label="Open expiration date picker" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-600 transition-colors hover:bg-white/60" onClick={() => nativeDatePicker.current?.showPicker()}><CalendarDays className="h-5 w-5" /></button><input ref={nativeDatePicker} tabIndex={-1} aria-hidden="true" className="pointer-events-none absolute h-0 w-0 opacity-0" type="date" value={formData.expirationDate} onChange={(e) => { update('expirationDate', e.target.value); setExpirationInput(e.target.value); }} /></div></div>
    <div className="flex justify-center pt-6 border-t border-slate-100"><Button type="submit" icon={Save} className="px-4 md:px-8">{initialMedication ? 'Save changes' : 'Save medication'}</Button></div>
  </form>;
}
