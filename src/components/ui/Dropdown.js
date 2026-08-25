import { useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePopover, usePopoverDismiss } from "@/lib/usePopover";

export default function Dropdown({
  value,
  onChange,
  options = [],
  placeholder = "Select…",
  className,
  disabled = false,
  align = "left",
  compact = false,
  "aria-label": ariaLabel,
}) {
  const [open, setOpen] = useState(false);
  const { mounted, rootRef, triggerRef, popoverRef, position } = usePopover({ open });
  usePopoverDismiss(open, setOpen, rootRef, popoverRef);

  const selected = options.find((o) => o.value === value);
  const displayLabel = selected?.label ?? placeholder;

  const handleSelect = (opt) => {
    if (opt.disabled) return;
    onChange(opt.value);
    setOpen(false);
  };

  const popover =
    open &&
    mounted &&
    createPortal(
      <div
        ref={popoverRef}
        role="listbox"
        aria-label={ariaLabel}
        className="fixed z-50 nx-card rounded-xl shadow-[var(--nx-shadow-md)] overflow-hidden animate-fade-in py-1"
        style={{
          top: position.placement === "bottom" ? position.top : undefined,
          bottom: position.placement === "top" ? window.innerHeight - position.top : undefined,
          left: position.left,
          width: position.width,
          maxHeight: "min(280px, 50vh)",
          overflowY: "auto",
        }}
      >
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={String(opt.value)}
              type="button"
              role="option"
              aria-selected={active}
              disabled={opt.disabled}
              onClick={() => handleSelect(opt)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                align === "center" && "justify-center",
                active
                  ? "bg-[var(--nx-accent-soft)] text-[var(--nx-accent)]"
                  : "text-[var(--nx-text)] hover:bg-[var(--nx-hover-bg)]",
                opt.disabled && "opacity-40 cursor-not-allowed"
              )}
            >
              {!compact && (
                <Check className={cn("w-3.5 h-3.5 shrink-0", !active && "invisible")} />
              )}
              <span className={cn("truncate", (align === "center" || compact) && "font-semibold")}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>,
      document.body
    );

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          "nx-input !h-10 w-full flex items-center gap-2 text-left transition-colors",
          (align === "center" || compact) && "justify-center",
          open && "border-[var(--nx-accent)] ring-[3px] ring-[var(--nx-accent-soft)]",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "truncate text-sm",
            !compact && "flex-1",
            (align === "center" || compact) && "font-semibold",
            !selected && "text-[var(--nx-text-faint)]"
          )}
        >
          {displayLabel}
        </span>
        {!compact && (
          <ChevronDown
            className={cn(
              "w-4 h-4 shrink-0 text-[var(--nx-text-faint)] transition-transform",
              open && "rotate-180"
            )}
          />
        )}
      </button>
      {popover}
    </div>
  );
}
