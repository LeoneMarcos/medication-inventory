export interface Medicamento {
  id: string;
  nome: string;
  lote: string;
  quantidade: number;
  validade: string; // ISO date string YYYY-MM-DD
  fabricante: string;
  quantidadeMinima: number;
}
