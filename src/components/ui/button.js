import * as React from "react";
import { cn } from "@/lib/utils";

const VARIANT_STYLES = {
  default:
    "bg-[var(--nx-accent)] text-white hover:bg-[var(--nx-accent-hover)]",
  destructive:
    "bg-[var(--nx-red)] text-white hover:bg-[#c03537]",
  outline:
    "border border-[var(--nx-border-strong)] bg-transparent hover:bg-[var(--nx-hover-bg)] text-[var(--nx-text)]",
  secondary:
    "bg-[var(--nx-bg-overlay)] text-[var(--nx-text)] hover:bg-[var(--nx-bg-raised)] border border-[var(--nx-border)]",
  ghost: "hover:bg-[var(--nx-hover-bg)] text-[var(--nx-text-muted)] hover:text-[var(--nx-text)]",
  success:
    "bg-[var(--nx-green)] text-white hover:bg-[#2d8a4e]",
  link: "text-[var(--nx-accent)] underline-offset-4 hover:underline",
};

const SIZE_STYLES = {
  default: "h-9 px-4 text-[13px]",
  sm: "h-8 px-3 text-xs rounded-lg",
  lg: "h-11 px-6 text-sm rounded-xl",
  icon: "h-9 w-9 p-0",
};

const Button = React.forwardRef(
  ({ className = "", variant = "default", size = "default", children, ...props }, ref) => (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nx-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--nx-bg-base)] disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]",
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  )
);
Button.displayName = "Button";

export { Button };
