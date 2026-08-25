import { useEffect, useRef, useState } from "react";
import { Monitor, Moon, Palette, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import ColorPicker from "@/components/ui/ColorPicker";
import {
  GRADIENTS,
  THEME_MODES,
  customGradientPreview,
  useTheme,
} from "@/context/ThemeContext";

const MODE_ICONS = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const PRESETS = GRADIENTS.filter((g) => g.id !== "custom");

export default function ThemeSwitcher({ side = "bottom" }) {
  const { mode, gradient, customAccent, setMode, setGradient, setCustomAccent } = useTheme();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleClick = (e) => {
      if (panelRef.current?.contains(e.target)) return;
      // ColorPicker popover is portaled outside the panel
      if (e.target.closest?.('[aria-label="Custom site gradient color"]')) return;
      setOpen(false);
    };

    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const activeLabel =
    gradient === "custom"
      ? "Custom"
      : GRADIENTS.find((g) => g.id === gradient)?.label;

  return (
    <div className="relative shrink-0 z-20" ref={panelRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Theme settings"
        className={cn(open && "bg-[var(--nx-hover-bg)] text-[var(--nx-text)]")}
      >
        <Palette className="w-[18px] h-[18px]" />
      </Button>

      {open && (
        <div
          className={cn(
            "absolute right-0 w-64 nx-card p-4 shadow-[var(--nx-shadow-md)] animate-fade-in z-[70]",
            side === "top" ? "bottom-full mb-2" : "top-full mt-2"
          )}
          role="dialog"
          aria-label="Theme settings"
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--nx-text-muted)] mb-2">
            Appearance
          </div>
          <div className="flex gap-1 p-1 rounded-lg bg-[var(--nx-bg-input)] border border-[var(--nx-border)]">
            {THEME_MODES.map((item) => {
              const Icon = MODE_ICONS[item.id];
              const active = mode === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMode(item.id)}
                  title={item.label}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-md text-[10px] font-semibold transition-all",
                    active
                      ? "bg-[var(--nx-accent-soft)] text-[var(--nx-text-heading)] shadow-sm"
                      : "text-[var(--nx-text-muted)] hover:text-[var(--nx-text)] hover:bg-[var(--nx-hover-bg)]"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--nx-text-muted)] mt-4 mb-2">
            Color gradient
          </div>
          <div className="grid grid-cols-6 gap-2">
            {PRESETS.map((item) => {
              const active = gradient === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setGradient(item.id)}
                  title={item.label}
                  className={cn(
                    "group relative aspect-square rounded-lg transition-all",
                    active
                      ? "ring-2 ring-[var(--nx-accent)] ring-offset-2 ring-offset-[var(--nx-bg-surface)] scale-105"
                      : "hover:scale-105 opacity-80 hover:opacity-100"
                  )}
                  style={{ background: item.preview }}
                  aria-label={item.label}
                  aria-pressed={active}
                />
              );
            })}
            <button
              type="button"
              onClick={() => setGradient("custom")}
              title="Custom"
              className={cn(
                "group relative aspect-square rounded-lg transition-all",
                gradient === "custom"
                  ? "ring-2 ring-[var(--nx-accent)] ring-offset-2 ring-offset-[var(--nx-bg-surface)] scale-105"
                  : "hover:scale-105 opacity-80 hover:opacity-100"
              )}
              style={{ background: customGradientPreview(customAccent) }}
              aria-label="Custom gradient"
              aria-pressed={gradient === "custom"}
            />
          </div>

          {gradient === "custom" && (
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-[var(--nx-border)] bg-[var(--nx-bg-input)] px-3 py-2.5">
              <ColorPicker
                value={customAccent}
                onChange={setCustomAccent}
                aria-label="Custom site gradient color"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--nx-text-heading)]">Custom</p>
                <p className="text-[11px] text-[var(--nx-text-faint)] font-mono uppercase truncate">
                  {customAccent}
                </p>
              </div>
            </div>
          )}

          <p className="mt-3 text-[11px] text-[var(--nx-text-faint)] text-center">
            {activeLabel}
          </p>
        </div>
      )}
    </div>
  );
}
