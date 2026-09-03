import type { Medication, MedicationStatus } from '../types';

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getMedicationStatus(medication: Medication, today = new Date()): MedicationStatus {
  const currentDay = startOfDay(today);
  const expiration = parseDateOnly(medication.expirationDate);
  const daysUntilExpiration = Math.round((expiration.getTime() - currentDay.getTime()) / DAY_MS);

  if (daysUntilExpiration < 0) return 'expired';
  if (daysUntilExpiration <= 30) return 'expiring soon';
  if (medication.quantity <= medication.minimumStock) return 'low stock';
  return 'healthy';
}

export function addStock(currentQuantity: number, amount: number): number {
  validateAmount(amount);
  return currentQuantity + amount;
}

export function removeStock(currentQuantity: number, amount: number): number {
  validateAmount(amount);
  if (amount > currentQuantity) {
    throw new Error('Cannot remove more stock than is available.');
  }
  return currentQuantity - amount;
}

function validateAmount(amount: number): void {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error('Stock amount must be a positive integer.');
  }
}
