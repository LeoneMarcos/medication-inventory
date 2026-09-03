import { describe, expect, it } from 'vitest';
import { addStock, getMedicationStatus, removeStock } from './medications';
import type { Medication } from '../types';

const today = new Date(2026, 8, 1);
const medication = (overrides: Partial<Medication> = {}): Medication => ({
  id: '1', name: 'Test medication', batch: 'B-1', quantity: 20,
  expirationDate: '2027-01-01', manufacturer: 'Test lab', minimumStock: 5, ...overrides,
});

describe('medication status', () => {
  it('identifies expired medication', () => expect(getMedicationStatus(medication({ expirationDate: '2026-08-31' }), today)).toBe('expired'));
  it('identifies medication expiring within 30 days', () => expect(getMedicationStatus(medication({ expirationDate: '2026-09-30' }), today)).toBe('expiring soon'));
  it('identifies healthy medication', () => expect(getMedicationStatus(medication(), today)).toBe('healthy'));
  it('identifies low stock', () => expect(getMedicationStatus(medication({ quantity: 5 }), today)).toBe('low stock'));
  it('prioritizes expiration over low stock', () => expect(getMedicationStatus(medication({ quantity: 0, expirationDate: '2026-08-31' }), today)).toBe('expired'));
});

describe('stock movements', () => {
  it('adds a defined quantity', () => expect(addStock(4, 6)).toBe(10));
  it('removes a defined quantity', () => expect(removeStock(10, 4)).toBe(6));
  it('rejects removal above available stock', () => expect(() => removeStock(3, 4)).toThrow());
  it('allows the minimum stock limit to be zero', () => expect(getMedicationStatus(medication({ quantity: 0, minimumStock: 0 }))).toBe('low stock'));
});
