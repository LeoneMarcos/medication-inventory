import { getMedicationFlags } from './medications';
import type { Medication, MedicationCategory } from '../types';

export type DashboardMetrics = Record<MedicationCategory, number> & { total: number };

export function getDashboardMetrics(medications: Medication[], today = new Date()): DashboardMetrics {
  const metrics: DashboardMetrics = {
    total: medications.length,
    healthy: 0,
    'low stock': 0,
    'expiring soon': 0,
    expired: 0,
  };

  medications.forEach((medication) => {
    const flags = getMedicationFlags(medication, today);
    if (flags.isHealthy) metrics.healthy += 1;
    if (flags.isLowStock) metrics['low stock'] += 1;
    if (flags.isExpiringSoon) metrics['expiring soon'] += 1;
    if (flags.isExpired) metrics.expired += 1;
  });

  return metrics;
}
