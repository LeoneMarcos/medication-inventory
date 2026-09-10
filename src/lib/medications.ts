import type { Medication, MedicationCategory, MedicationFlags, MedicationStatus } from '../types';
import { isValidDateOnly } from './storage';

export { isValidDateOnly };

export const MAX_STOCK_LIMIT = Number.MAX_SAFE_INTEGER;

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

export function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function parseDateInputToIso(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  // ISO format: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return isValidDateOnly(trimmed) ? trimmed : null;
  }

  // MM/DD/YYYY format
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    const [month, day, year] = trimmed.split('/');
    const iso = `${year}-${month}-${day}`;
    return isValidDateOnly(iso) ? iso : null;
  }

  return null;
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
  if (amount > MAX_STOCK_LIMIT - currentQuantity) {
    throw new Error(`Stock limit exceeded: total quantity cannot exceed ${MAX_STOCK_LIMIT.toLocaleString('en-US')} units.`);
  }
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
