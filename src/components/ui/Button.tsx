import { forwardRef } from "react";
import { cn } from "../../lib/utils";
import type { LucideIcon } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = "primary",
      size = "md",
      icon: Icon,
      children,
      type = "button",
      ...props
    }: ButtonProps,
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "ui-button",
          `button-${variant}`,
          `button-${size}`,
          className,
        )}
        {...props}
      >
        {Icon && <Icon size={18} strokeWidth={1.8} aria-hidden="true" />}
        {children}
      </button>
    );
  },
);
