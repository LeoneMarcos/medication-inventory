import type { Medication } from '../types';

export const STORAGE_KEY = 'medication-inventory-data';

export function isValidDateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function isMedication(value: unknown): value is Medication {
  if (!value || typeof value !== 'object') return false;

  const medication = value as Partial<Medication>;
  return Boolean(
    typeof medication.id === 'string' && medication.id.trim() &&
    typeof medication.name === 'string' && medication.name.trim() &&
    typeof medication.batch === 'string' && medication.batch.trim() &&
    typeof medication.manufacturer === 'string' &&
    typeof medication.quantity === 'number' && Number.isInteger(medication.quantity) && medication.quantity >= 0 &&
    typeof medication.minimumStock === 'number' && Number.isInteger(medication.minimumStock) && medication.minimumStock >= 0 &&
    typeof medication.expirationDate === 'string' && isValidDateOnly(medication.expirationDate),
  );
}

/** Parse browser storage without allowing malformed data to enter the UI. */
export function parseStoredMedications(raw: string | null): Medication[] {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isMedication) : [];
  } catch {
    return [];
  }
}

/** Persist medications safely to localStorage, returning status and descriptive error if storage fails. */
export function saveStoredMedications(medications: Medication[]): { success: boolean; error?: string } {
  try {
    if (typeof localStorage === 'undefined') {
      return { success: false, error: 'Browser storage is unavailable in this environment.' };
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(medications));
    return { success: true };
  } catch (error) {
    console.error('Unable to save inventory to storage:', error);
    const isQuota = error instanceof Error && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED');
    const message = isQuota
      ? 'Storage quota exceeded. Unable to save medication changes locally.'
      : 'Browser storage is restricted or unavailable. Changes could not be saved to this device.';
    return { success: false, error: message };
  }
}
