import { describe, expect, it } from 'vitest';
import { getDashboardMetrics } from './metrics';
import type { Medication } from '../types';

const base: Medication = { id: '1', name: 'Medication', batch: 'B', quantity: 10, expirationDate: '2027-01-01', manufacturer: 'Lab', minimumStock: 2 };
describe('dashboard metrics', () => {
  it('counts each status separately, including expired items', () => {
    const medications = [
      base,
      { ...base, id: '2', quantity: 2 },
      { ...base, id: '3', expirationDate: '2026-09-20' },
      { ...base, id: '4', expirationDate: '2026-08-20' },
    ];
    expect(getDashboardMetrics(medications, new Date(2026, 8, 1))).toEqual({ total: 4, healthy: 1, 'low stock': 1, 'expiring soon': 1, expired: 1 });
  });
});
