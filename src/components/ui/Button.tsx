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
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-95 focus:ring-blue-500 font-bold',
    secondary: 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm active:scale-95 focus:ring-slate-400 font-bold',
    danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-md active:scale-95 focus:ring-rose-400',
    ghost: 'text-slate-600 hover:bg-slate-100/80 active:scale-95 focus:ring-slate-300 font-bold',
  };

  const sizes = {
    sm: 'h-9 px-4 text-sm rounded-lg',
    md: 'h-11 px-5 py-2.5 rounded-xl',
    lg: 'h-14 px-8 text-lg rounded-2xl',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer group',
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
