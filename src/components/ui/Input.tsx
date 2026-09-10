import { forwardRef, useId } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, error, id, required, ...props }: InputProps,
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="required-mark" title="Required field">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn('ui-input', error && 'input-error', className)}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">
          {error}
        </p>
      )}
    </div>
  );
});
