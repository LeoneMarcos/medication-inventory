import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

export function Input({ className, label, error, id, required, ...props }: InputProps) {
  // Use id if provided, otherwise generate a random one if needed (but simple is better)
  // or just rely on passing id for accessibility
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-bold text-slate-700 mb-1.5 flex items-center">
          {label}
          {required && <span className="text-blue-600 ml-1" title="Required field">*</span>}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'flex h-11 w-full rounded-xl border border-white/75 bg-white/25 backdrop-blur-xl px-3 py-2 text-sm text-slate-700 placeholder:text-slate-500 shadow-[inset_0_1px_2px_rgba(255,255,255,0.65),0_4px_14px_rgba(49,93,142,0.04)] transition-all duration-200 focus:bg-white/50 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-white focus:shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_4px_14px_rgba(14,165,233,0.12)] disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-blue-500 focus:ring-blue-500/10 focus:border-blue-500',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
