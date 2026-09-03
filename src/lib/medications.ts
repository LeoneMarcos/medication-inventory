import type { Medication, MedicationCategory, MedicationFlags, MedicationStatus } from '../types';

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getMedicationFlags(medication: Medication, today = new Date()): MedicationFlags {
  const currentDay = startOfDay(today);
  const expiration = parseDateOnly(medication.expirationDate);
  const daysUntilExpiration = Math.round((expiration.getTime() - currentDay.getTime()) / DAY_MS);

  const isExpired = daysUntilExpiration < 0;
  const isExpiringSoon = daysUntilExpiration >= 0 && daysUntilExpiration <= 30;
  const isLowStock = medication.quantity <= medication.minimumStock;
  const isHealthy = !isExpired && !isExpiringSoon && !isLowStock;

  return {
    isExpired,
    isExpiringSoon,
    isLowStock,
    isHealthy,
  };
}

export function getMedicationCategories(medication: Medication, today = new Date()): MedicationCategory[] {
  const flags = getMedicationFlags(medication, today);
  const categories: MedicationCategory[] = [];

  if (flags.isExpired) categories.push('expired');
  if (flags.isExpiringSoon) categories.push('expiring soon');
  if (flags.isLowStock) categories.push('low stock');
  if (flags.isHealthy) categories.push('healthy');

  return categories;
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
