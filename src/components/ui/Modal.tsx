import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300">
        <div className="flex items-center justify-between border-b border-slate-50 px-8 py-6 bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h2>
            <p className="text-sm text-slate-500 font-medium">Preencha todos os campos obrigatórios</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fechar" className="rounded-full h-10 w-10 p-0">
             <X className="h-6 w-6" />
          </Button>
        </div>
        <div className="px-6 md:px-8 pt-2 pb-8 md:pb-10 font-sans">{children}</div>
      </div>
    </div>
  );
}
