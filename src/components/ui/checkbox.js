import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const CheckboxIndicator = React.forwardRef(
  ({ checked = false, disabled = false, className = "" }, ref) => (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn(
        "nx-checkbox",
        checked && "nx-checkbox-checked",
        disabled && "nx-checkbox-disabled",
        className
      )}
    >
      {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
    </span>
  )
);
CheckboxIndicator.displayName = "CheckboxIndicator";

const Checkbox = React.forwardRef(
  (
    {
      checked = false,
      onCheckedChange,
      onChange,
      disabled = false,
      label,
      className = "",
      labelClassName = "",
      id,
      name,
      ...props
    },
    ref
  ) => {
    const handleChange = (e) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    return (
      <label
        className={cn(
          "inline-flex items-center gap-2 cursor-pointer select-none",
          disabled && "cursor-not-allowed opacity-40",
          className
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          id={id}
          name={name}
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          className="sr-only peer"
          {...props}
        />
        <CheckboxIndicator
          checked={checked}
          disabled={disabled}
          className="peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--nx-accent)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--nx-bg-base)]"
        />
        {label != null && (
          <span className={cn("text-xs text-[var(--nx-text-muted)]", labelClassName)}>{label}</span>
        )}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox, CheckboxIndicator };
