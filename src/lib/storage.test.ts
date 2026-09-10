import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  isValidDateOnly,
  parseStoredMedications,
  saveStoredMedications,
  STORAGE_KEY,
} from './storage';
import type { Medication } from '../types';

const validMedication: Medication = {
  id: 'medication-1',
  name: 'Amoxicillin',
  batch: 'A-100',
  quantity: 10,
  expirationDate: '2027-01-01',
  manufacturer: 'Pharma Lab',
  minimumStock: 2,
};

describe('stored inventory parsing', () => {
  it('returns valid medication records', () => {
    expect(parseStoredMedications(JSON.stringify([validMedication]))).toEqual([validMedication]);
  });

  it('ignores malformed records and malformed JSON', () => {
    expect(
      parseStoredMedications(
        JSON.stringify([
          validMedication,
          { ...validMedication, quantity: 1.5 },
          { ...validMedication, quantity: -5 },
          { ...validMedication, minimumStock: -1 },
          { ...validMedication, minimumStock: 2.3 },
          { ...validMedication, expirationDate: '2027-02-31' },
          { ...validMedication, expirationDate: 'invalid-date' },
          { ...validMedication, id: '' },
          { ...validMedication, name: '   ' },
          { ...validMedication, batch: '' },
          null,
          42,
          'not a record',
        ]),
      ),
    ).toEqual([validMedication]);

    expect(parseStoredMedications('{ invalid json')).toEqual([]);
    expect(parseStoredMedications(JSON.stringify({ medications: [validMedication] }))).toEqual([]);
    expect(parseStoredMedications(null)).toEqual([]);
    expect(parseStoredMedications('')).toEqual([]);
  });
});

describe('storage date validation', () => {
  it('validates leap years and non-existent days correctly', () => {
    expect(isValidDateOnly('2024-02-29')).toBe(true); // leap year
    expect(isValidDateOnly('2025-02-29')).toBe(false); // non-leap year
    expect(isValidDateOnly('2026-04-31')).toBe(false); // April has 30 days
    expect(isValidDateOnly('2026-12-31')).toBe(true);
    expect(isValidDateOnly('not-a-date')).toBe(false);
  });
});

describe('saving stored medications', () => {
  let store: Map<string, string>;
  const originalLocalStorage = globalThis.localStorage;

  beforeEach(() => {
    store = new Map<string, string>();
    const mockStorage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, String(value)),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear(),
      get length() {
        return store.size;
      },
      key: (i: number) => Array.from(store.keys())[i] ?? null,
    };
    Object.defineProperty(globalThis, 'localStorage', {
      value: mockStorage,
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: originalLocalStorage,
      configurable: true,
      writable: true,
    });
    vi.restoreAllMocks();
  });

  it('successfully persists valid medications to localStorage', () => {
    const result = saveStoredMedications([validMedication]);
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify([validMedication]));
  });

  it('handles QuotaExceededError proportionally when storage is full', () => {
    const quotaError = new Error('Quota exceeded');
    quotaError.name = 'QuotaExceededError';

    vi.spyOn(localStorage, 'setItem').mockImplementationOnce(() => {
      throw quotaError;
    });

    const result = saveStoredMedications([validMedication]);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Storage quota exceeded');
  });

  it('handles general storage restrictions proportionally', () => {
    vi.spyOn(localStorage, 'setItem').mockImplementationOnce(() => {
      throw new Error('SecurityError: access denied');
    });

    const result = saveStoredMedications([validMedication]);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Browser storage is restricted or unavailable');
  });
});
