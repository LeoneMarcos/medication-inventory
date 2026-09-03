import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Medicamento } from '../types';

const STORAGE_KEY = 'estoque-medicinal-data';

export function useEstoque() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erro ao carregar do localStorage:', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(medicamentos));
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  }, [medicamentos]);

  const adicionar = (item: Omit<Medicamento, 'id'>) => {
    const novoItem: Medicamento = { ...item, id: uuidv4() };
    setMedicamentos((prev) => [...prev, novoItem]);
  };

  const remover = (id: string) => {
    setMedicamentos((prev) => prev.filter((item) => item.id !== id));
  };

  const atualizar = (id: string, updates: Partial<Omit<Medicamento, 'id'>>) => {
    setMedicamentos((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const darBaixa = (id: string, quantidade: number) => {
    const qtd = Number(quantidade);
    setMedicamentos((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const novaQtd = Math.max(0, item.quantidade - qtd);
          return { ...item, quantidade: novaQtd };
        }
        return item;
      })
    );
  };

  return { medicamentos, adicionar, remover, atualizar, darBaixa };
}
