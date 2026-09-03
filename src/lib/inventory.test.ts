import { describe, expect, it } from 'vitest';
import { filterMedications } from './inventory';
import type { Medication } from '../types';

const medications: Medication[] = [
  { id: '1', name: 'Amoxicillin', batch: 'A-100', quantity: 5, expirationDate: '2027-01-01', manufacturer: 'Pharma Lab', minimumStock: 1 },
  { id: '2', name: 'Ibuprofen', batch: 'I-200', quantity: 5, expirationDate: '2027-01-01', manufacturer: 'Health Co', minimumStock: 1 },
];
describe('medication search', () => {
  it('filters by name, batch, or manufacturer case-insensitively', () => {
    expect(filterMedications(medications, 'amoxi')).toHaveLength(1);
    expect(filterMedications(medications, 'i-200')[0].name).toBe('Ibuprofen');
    expect(filterMedications(medications, 'health')[0].name).toBe('Ibuprofen');
  });
  it('returns all medications for an empty query', () => expect(filterMedications(medications, ' ')).toEqual(medications));
});
