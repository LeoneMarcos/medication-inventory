import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { Medicamento } from '../../types';

interface MedicationFormProps {
  onSubmit: (data: Omit<Medicamento, 'id'>) => void;
  onCancel: () => void;
}

export function MedicationForm({ onSubmit, onCancel }: MedicationFormProps) {
  const [formData, setFormData] = useState({
    nome: '',
    lote: '',
    quantidade: '',
    validade: '',
    fabricante: '',
    quantidadeMinima: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nome) newErrors.nome = 'Nome é obrigatório';
    if (!formData.lote) newErrors.lote = 'Lote é obrigatório';
    if (!formData.quantidade || Number(formData.quantidade) < 0) newErrors.quantidade = 'Quantidade inválida';
    if (!formData.validade) newErrors.validade = 'Validade é obrigatória';
    if (!formData.quantidadeMinima || Number(formData.quantidadeMinima) < 0) newErrors.quantidadeMinima = 'Qtd Mínima inválida';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        nome: formData.nome,
        lote: formData.lote,
        quantidade: Number(formData.quantidade),
        validade: formData.validade,
        fabricante: formData.fabricante || 'Desconhecido',
        quantidadeMinima: Number(formData.quantidadeMinima),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Input
          id="nome"
          label="Nome Comercial / Princípio Ativo"
          placeholder="Ex: Amoxicilina 500mg"
          value={formData.nome}
          onChange={e => setFormData({...formData, nome: e.target.value})}
          error={errors.nome}
          required
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="lote"
            label="Número do Lote"
            placeholder="Ex: LT-2025-001"
            value={formData.lote}
            onChange={e => setFormData({...formData, lote: e.target.value})}
            error={errors.lote}
            required
          />
          <Input
            id="fabricante"
            label="Laboratório / Fabricante"
            placeholder="Ex: Eurofarma"
            value={formData.fabricante}
            onChange={e => setFormData({...formData, fabricante: e.target.value})}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="quantidade"
            label="Estoque Atual"
            type="number"
            placeholder="0"
            value={formData.quantidade}
            onChange={e => setFormData({...formData, quantidade: e.target.value})}
            error={errors.quantidade}
            required
          />
           <Input
            id="quantidadeMinima"
            label="Estoque de Segurança"
            type="number"
            placeholder="Ex: 5"
            value={formData.quantidadeMinima}
            onChange={e => setFormData({...formData, quantidadeMinima: e.target.value})}
            error={errors.quantidadeMinima}
            required
          />
        </div>
        <Input
          id="validade"
          label="Data de Vencimento"
          type="date"
          value={formData.validade}
          onChange={e => setFormData({...formData, validade: e.target.value})}
          error={errors.validade}
          required
        />
      </div>
      
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
        <Button type="button" variant="ghost" onClick={onCancel}>Descartar</Button>
        <Button type="submit" className="px-4 md:px-8 whitespace-nowrap">Salvar no Inventário</Button>
      </div>
    </form>
  );
}
