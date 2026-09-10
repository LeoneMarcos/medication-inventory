import { useState } from "react";
import { addStock, removeStock } from "../lib/medications";
import {
  parseStoredMedications,
  saveStoredMedications,
  STORAGE_KEY,
} from "../lib/storage";
import type { Medication } from "../types";

export function useInventory() {
  const [medications, setMedications] = useState<Medication[]>(() => {
    try {
      return parseStoredMedications(localStorage.getItem(STORAGE_KEY));
    } catch (error) {
      console.error("Unable to load inventory:", error);
      return [];
    }
  });
  const addMedication = (medication: Omit<Medication, "id">): boolean => {
    const next = [...medications, { ...medication, id: crypto.randomUUID() }];
    const result = saveStoredMedications(next);
    if (!result.success) {
      return false;
    }
    setMedications(next);
    return true;
  };

  const updateMedication = (
    id: string,
    updates: Partial<Omit<Medication, "id">>,
  ): boolean => {
    const next = medications.map((medication) =>
      medication.id === id ? { ...medication, ...updates } : medication,
    );
    const result = saveStoredMedications(next);
    if (!result.success) {
      return false;
    }
    setMedications(next);
    return true;
  };

  const deleteMedication = (id: string): boolean => {
    const next = medications.filter((medication) => medication.id !== id);
    const result = saveStoredMedications(next);
    if (!result.success) {
      return false;
    }
    setMedications(next);
    return true;
  };

  const addQuantity = (id: string, amount: number): boolean => {
    const next = medications.map((medication) =>
      medication.id === id
        ? { ...medication, quantity: addStock(medication.quantity, amount) }
        : medication,
    );
    const result = saveStoredMedications(next);
    if (!result.success) {
      return false;
    }
    setMedications(next);
    return true;
  };

  const removeQuantity = (id: string, amount: number): boolean => {
    const next = medications.map((medication) =>
      medication.id === id
        ? { ...medication, quantity: removeStock(medication.quantity, amount) }
        : medication,
    );
    const result = saveStoredMedications(next);
    if (!result.success) {
      return false;
    }
    setMedications(next);
    return true;
  };

  const replaceMedications = (nextMedications: Medication[]): boolean => {
    const result = saveStoredMedications(nextMedications);
    if (!result.success) {
      return false;
    }
    setMedications(nextMedications);
    return true;
  };

  return {
    medications,
    addMedication,
    updateMedication,
    deleteMedication,
    addQuantity,
    removeQuantity,
    replaceMedications,
  };
}
