import { describe, expect, it } from 'vitest';
import { addStock, getMedicationCategories, getMedicationFlags, getMedicationStatus, removeStock } from './medications';
import type { Medication } from '../types';

const today = new Date(2026, 8, 1);
const medication = (overrides: Partial<Medication> = {}): Medication => ({
  id: '1', name: 'Test medication', batch: 'B-1', quantity: 20,
  expirationDate: '2027-01-01', manufacturer: 'Test lab', minimumStock: 5, ...overrides,
});
describe('medication status (primary classification)', () => {
  it('identifies expired medication', () => expect(getMedicationStatus(medication({ expirationDate: '2026-08-31' }), today)).toBe('expired'));
  it('identifies medication expiring within 30 days', () => expect(getMedicationStatus(medication({ expirationDate: '2026-09-30' }), today)).toBe('expiring soon'));
  it('identifies healthy medication', () => expect(getMedicationStatus(medication(), today)).toBe('healthy'));
  it('identifies low stock', () => expect(getMedicationStatus(medication({ quantity: 5 }), today)).toBe('low stock'));
  it('prioritizes expiration over low stock for primary status', () => expect(getMedicationStatus(medication({ quantity: 0, expirationDate: '2026-08-31' }), today)).toBe('expired'));
  it('prioritizes expiring soon over low stock for primary status when both apply', () => expect(getMedicationStatus(medication({ quantity: 2, expirationDate: '2026-09-15' }), today)).toBe('expiring soon'));
});

describe('medication flags and categories', () => {
  it('extracts healthy flags and category', () => {
    const healthyMed = medication();
    expect(getMedicationFlags(healthyMed, today)).toEqual({
      isExpired: false,
      isExpiringSoon: false,
      isLowStock: false,
      isHealthy: true,
    });
    expect(getMedicationCategories(healthyMed, today)).toEqual(['healthy']);
  });

  it('extracts expired flags and category', () => {
    const expiredMed = medication({ expirationDate: '2026-08-31' });
    expect(getMedicationFlags(expiredMed, today)).toEqual({
      isExpired: true,
      isExpiringSoon: false,
      isLowStock: false,
      isHealthy: false,
    });
    expect(getMedicationCategories(expiredMed, today)).toEqual(['expired']);
  });

  it('identifies overlapping expiring soon + low stock simultaneously', () => {
    const overlapping = medication({ quantity: 3, minimumStock: 5, expirationDate: '2026-09-15' });
    expect(getMedicationFlags(overlapping, today)).toEqual({
      isExpired: false,
      isExpiringSoon: true,
      isLowStock: true,
      isHealthy: false,
    });
    expect(getMedicationCategories(overlapping, today)).toEqual(['expiring soon', 'low stock']);
  });

  it('identifies overlapping expired + low stock simultaneously', () => {
    const expiredLowStock = medication({ quantity: 0, minimumStock: 5, expirationDate: '2026-08-31' });
    expect(getMedicationFlags(expiredLowStock, today)).toEqual({
      isExpired: true,
      isExpiringSoon: false,
      isLowStock: true,
      isHealthy: false,
    });
    expect(getMedicationCategories(expiredLowStock, today)).toEqual(['expired', 'low stock']);
  });
});

describe('stock movements', () => {
  it('adds a defined quantity', () => expect(addStock(4, 6)).toBe(10));
  it('removes a defined quantity', () => expect(removeStock(10, 4)).toBe(6));
  it('rejects removal above available stock', () => expect(() => removeStock(3, 4)).toThrow());
  it('allows the minimum stock limit to be zero', () => expect(getMedicationStatus(medication({ quantity: 0, minimumStock: 0 }))).toBe('low stock'));
});
