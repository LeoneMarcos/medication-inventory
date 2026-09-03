import { describe, expect, it } from 'vitest';
import { getDashboardMetrics } from './metrics';
import type { Medication } from '../types';

const base: Medication = { id: '1', name: 'Medication', batch: 'B', quantity: 10, expirationDate: '2027-01-01', manufacturer: 'Lab', minimumStock: 2 };

describe('dashboard metrics', () => {
  it('counts distinct items without overlaps', () => {
    const medications = [
      base,
      { ...base, id: '2', quantity: 2 },
      { ...base, id: '3', expirationDate: '2026-09-20' },
      { ...base, id: '4', expirationDate: '2026-08-20' },
    ];
    expect(getDashboardMetrics(medications, new Date(2026, 8, 1))).toEqual({ total: 4, healthy: 1, 'low stock': 1, 'expiring soon': 1, expired: 1 });
  });

  it('correctly tallies overlapping categories when a medication is both expiring soon and low stock', () => {
    const medications = [
      // Expiring soon AND low stock
      { ...base, id: '1', quantity: 1, minimumStock: 5, expirationDate: '2026-09-15' },
      // Healthy
      { ...base, id: '2', quantity: 10, minimumStock: 5, expirationDate: '2027-05-01' },
    ];

    expect(getDashboardMetrics(medications, new Date(2026, 8, 1))).toEqual({
      total: 2,
      healthy: 1,
      'low stock': 1,
      'expiring soon': 1,
      expired: 0,
    });
  });

  it('correctly tallies overlapping categories when a medication is both expired and low stock', () => {
    const medications = [
      // Expired AND low stock
      { ...base, id: '1', quantity: 0, minimumStock: 5, expirationDate: '2026-08-10' },
      // Expiring soon
      { ...base, id: '2', quantity: 10, minimumStock: 5, expirationDate: '2026-09-10' },
      // Healthy
      { ...base, id: '3', quantity: 10, minimumStock: 5, expirationDate: '2027-01-01' },
    ];

    expect(getDashboardMetrics(medications, new Date(2026, 8, 1))).toEqual({
      total: 3,
      healthy: 1,
      'low stock': 1,
      'expiring soon': 1,
      expired: 1,
    });
  });
});
