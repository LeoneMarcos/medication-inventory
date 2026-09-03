import { AlertCircle, AlertTriangle, CheckCircle2, Package, XCircle } from 'lucide-react';
import { getDashboardMetrics } from '../../lib/metrics';
import type { Medication } from '../../types';
import { Card, CardContent } from '../ui/Card';

export function DashboardStats({ medications }: { medications: Medication[] }) {
  const metrics = getDashboardMetrics(medications);
  const cards = [
    { label: 'Total medications', value: metrics.total, icon: Package },
    { label: 'Healthy', value: metrics.healthy, icon: CheckCircle2 },
    { label: 'Low stock', value: metrics['low stock'], icon: AlertTriangle },
    { label: 'Expiring 30d', value: metrics['expiring soon'], icon: AlertCircle },
    { label: 'Expired', value: metrics.expired, icon: XCircle },
  ];
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{cards.map(({ label, value, icon: Icon }, index) => <Card key={label} className="border-t-4 border-t-brand-500 bg-white/24 backdrop-blur-2xl hover:-translate-y-1 hover:shadow-[0_22px_45px_rgba(49,93,142,0.20)] transition-all duration-300 animate-rise" style={{ animationDelay: index * 60 + 'ms' }}><CardContent className="relative flex items-center p-4 xl:p-6 gap-3 xl:gap-4 overflow-hidden"><div className="relative p-2.5 xl:p-3 rounded-2xl bg-brand-500/85 text-white border border-white/55 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_6px_14px_rgba(14,165,233,0.18)]"><Icon className="h-5 w-5" strokeWidth={2.25} /></div><div className="relative min-w-0"><p className="whitespace-nowrap text-[9px] xl:text-[10px] font-bold text-slate-600 uppercase tracking-[0.1em] xl:tracking-[0.13em] leading-tight">{label}</p><h4 className="font-display text-3xl font-extrabold text-slate-900 mt-1">{value}</h4></div></CardContent></Card>)}</div>;
}
