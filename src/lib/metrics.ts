import { getMedicationStatus } from './medications';
import type { Medication, MedicationStatus } from '../types';

export type DashboardMetrics = Record<MedicationStatus, number> & { total: number };

export function getDashboardMetrics(medications: Medication[], today = new Date()): DashboardMetrics {
  const metrics: DashboardMetrics = {
    total: medications.length,
    healthy: 0,
    'low stock': 0,
    'expiring soon': 0,
    expired: 0,
  };

  medications.forEach((medication) => {
    metrics[getMedicationStatus(medication, today)] += 1;
  });
  return metrics;
}
