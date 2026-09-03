import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, description = 'Complete all required fields', children }: ModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/28 backdrop-blur-xl p-4 transition-all duration-300">
      <div className="bg-white/42 backdrop-blur-3xl border border-white/85 rounded-[2rem] shadow-[0_24px_80px_rgba(39,78,125,0.24)] w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300">
        <div className="flex items-center justify-between border-b border-white/70 px-8 py-6 bg-white/22">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h2>
             {description && <p className="text-sm text-slate-500 font-medium">{description}</p>}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close" className="rounded-full h-10 w-10 p-0">
             <X className="h-6 w-6" />
          </Button>
        </div>
        <div className="px-6 md:px-8 pt-6 pb-8 md:pb-10 font-sans">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
