import * as React from "react";
import { cn } from "@/lib/utils";

const Toggle = React.forwardRef(
  (
    {
      checked = false,
      onCheckedChange,
      disabled = false,
      label,
      description,
      className = "",
      labelClassName = "",
      id,
      size = "default",
      ...props
    },
    ref
  ) => {
    const handleToggle = () => {
      if (disabled) return;
      onCheckedChange?.(!checked);
    };

    return (
      <div
        className={cn(
          "inline-flex items-center gap-3 select-none",
          description && "items-start",
          disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer",
          className
        )}
      >
        <button
          ref={ref}
          type="button"
          role="switch"
          id={id}
          aria-checked={checked}
          aria-disabled={disabled || undefined}
          disabled={disabled}
          onClick={handleToggle}
          className={cn(
            "nx-toggle",
            size === "sm" && "nx-toggle-sm",
            checked && "nx-toggle-checked",
            disabled && "nx-toggle-disabled",
            description && "mt-0.5"
          )}
          {...props}
        >
          <span className="nx-toggle-thumb" aria-hidden="true" />
        </button>
        {(label != null || description != null) && (
          <button
            type="button"
            disabled={disabled}
            onClick={handleToggle}
            className="min-w-0 flex flex-col gap-0.5 text-left bg-transparent border-0 p-0 cursor-inherit disabled:cursor-not-allowed"
          >
            {label != null && (
              <span
                className={cn(
                  "text-xs font-semibold text-[var(--nx-text-heading)] leading-snug",
                  labelClassName
                )}
              >
                {label}
              </span>
            )}
            {description != null && (
              <span className="text-[11px] text-[var(--nx-text-muted)] leading-snug">
                {description}
              </span>
            )}
          </button>
        )}
      </div>
    );
  }
);
Toggle.displayName = "Toggle";

export { Toggle };
