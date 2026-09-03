import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { addStock, removeStock } from '../lib/medications';
import type { Medication } from '../types';

const STORAGE_KEY = 'medication-inventory-data';

export function useInventory() {
  const [medications, setMedications] = useState<Medication[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Unable to load inventory:', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(medications));
    } catch (error) {
      console.error('Unable to save inventory:', error);
    }
  }, [medications]);

  const addMedication = (medication: Omit<Medication, 'id'>) => {
    setMedications((current) => [...current, { ...medication, id: uuidv4() }]);
  };

  const updateMedication = (id: string, updates: Partial<Omit<Medication, 'id'>>) => {
    setMedications((current) => current.map((medication) =>
      medication.id === id ? { ...medication, ...updates } : medication,
    ));
  };

  const deleteMedication = (id: string) => {
    setMedications((current) => current.filter((medication) => medication.id !== id));
  };

  const addQuantity = (id: string, amount: number) => {
    setMedications((current) => current.map((medication) =>
      medication.id === id ? { ...medication, quantity: addStock(medication.quantity, amount) } : medication,
    ));
  };

  const removeQuantity = (id: string, amount: number) => {
    setMedications((current) => current.map((medication) =>
      medication.id === id ? { ...medication, quantity: removeStock(medication.quantity, amount) } : medication,
    ));
  };

  return { medications, addMedication, updateMedication, deleteMedication, addQuantity, removeQuantity };
}
