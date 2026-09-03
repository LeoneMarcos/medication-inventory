export type MedicationStatus = 'healthy' | 'low stock' | 'expiring soon' | 'expired';

export interface MedicationFlags {
  isExpired: boolean;
  isExpiringSoon: boolean;
  isLowStock: boolean;
  isHealthy: boolean;
}
export type MedicationCategory = MedicationStatus;

export interface Medication {
  id: string;
  name: string;
  batch: string;
  quantity: number;
  expirationDate: string;
  manufacturer: string;
  minimumStock: number;
}
