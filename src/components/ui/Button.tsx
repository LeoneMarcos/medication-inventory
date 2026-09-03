import { cn } from '../../lib/utils';
import type { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-blue-600/80 backdrop-blur-xl text-white border border-white/55 hover:bg-blue-600/90 hover:shadow-lg shadow-md shadow-blue-500/25 active:scale-95 focus:ring-blue-500 font-bold',
    secondary: 'bg-white/28 backdrop-blur-xl text-slate-700 border border-white/70 hover:bg-white/50 hover:border-white/90 shadow-sm active:scale-95 focus:ring-slate-400 font-bold',
    danger: 'bg-blue-400/25 backdrop-blur-xl text-blue-800 border border-white/65 hover:bg-blue-400/40 shadow-sm active:scale-95 focus:ring-blue-400',
    ghost: 'bg-white/58 backdrop-blur-xl text-slate-800 border border-white/90 hover:bg-white/75 hover:border-white shadow-md shadow-slate-900/10 active:scale-95 focus:ring-slate-400 font-bold',
  };

  const sizes = {
    sm: 'h-9 px-4 text-sm rounded-lg',
    md: 'h-11 px-5 py-2.5 rounded-xl',
    lg: 'h-14 px-8 text-lg rounded-2xl',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer group shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {Icon && <Icon className={cn("h-5 w-5", children ? "mr-2.5 transition-transform group-hover:scale-110" : "")} />}
      {children}
    </button>
  );
}
