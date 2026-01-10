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
          {required && <span className="text-rose-500 ml-1" title="Campo obrigatório">*</span>}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
