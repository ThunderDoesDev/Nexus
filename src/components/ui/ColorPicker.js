import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { hexToHsv, hsvToHex, normalizeHex } from "@/lib/colors";
import { usePopover, usePopoverDismiss } from "@/lib/usePopover";

const POPOVER_WIDTH = 260;
const POPOVER_HEIGHT = 320;

const PRESETS = [
  "#5865f2",
  "#2ecc71",
  "#e74c3c",
  "#faa81a",
  "#eb459e",
  "#ffffff",
  "#4e5058",
  "#248046",
  "#da373c",
];

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function useDrag(handler) {
  const onPointerDown = useCallback(
    (e) => {
      e.preventDefault();
      const target = e.currentTarget;
      target.setPointerCapture(e.pointerId);

      const move = (ev) => handler(ev, target);
      const up = () => {
        target.releasePointerCapture(e.pointerId);
        target.removeEventListener("pointermove", move);
        target.removeEventListener("pointerup", up);
        target.removeEventListener("pointercancel", up);
      };

      move(e);
      target.addEventListener("pointermove", move);
      target.addEventListener("pointerup", up);
      target.addEventListener("pointercancel", up);
    },
    [handler]
  );

  return onPointerDown;
}

export default function ColorPicker({
  value = "#5865f2",
  onChange,
  className,
  disabled = false,
  "aria-label": ariaLabel = "Pick a color",
}) {
  const [open, setOpen] = useState(false);
  const safeValue = normalizeHex(value) || "#5865f2";
  const [hsv, setHsv] = useState(() => hexToHsv(safeValue));
  const [hexInput, setHexInput] = useState(safeValue);
  const hsvRef = useRef(hsv);
  hsvRef.current = hsv;

  const { mounted, rootRef, triggerRef, popoverRef, position, updatePosition } = usePopover({
    open,
    estimatedHeight: POPOVER_HEIGHT,
    estimatedWidth: POPOVER_WIDTH,
    matchTriggerWidth: false,
  });
  usePopoverDismiss(open, setOpen, rootRef, popoverRef);

  useEffect(() => {
    if (!open) return;
    const next = hexToHsv(safeValue);
    setHsv(next);
    setHexInput(safeValue);
  }, [open, safeValue]);

  useEffect(() => {
    if (open) requestAnimationFrame(updatePosition);
  }, [open, hsv, updatePosition]);

  const emitColor = (nextHsv) => {
    setHsv(nextHsv);
    const hex = hsvToHex(nextHsv.h, nextHsv.s, nextHsv.v);
    if (hex) {
      setHexInput(hex);
      onChange?.(hex);
    }
  };

  const handleSvDrag = useDrag((e, el) => {
    const rect = el.getBoundingClientRect();
    const s = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
    const v = clamp(100 - ((e.clientY - rect.top) / rect.height) * 100, 0, 100);
    emitColor({ ...hsvRef.current, s, v });
  });

  const handleHueDrag = useDrag((e, el) => {
    const rect = el.getBoundingClientRect();
    const h = clamp(((e.clientX - rect.left) / rect.width) * 360, 0, 360);
    emitColor({ ...hsvRef.current, h });
  });

  const handleHexChange = (raw) => {
    setHexInput(raw);
    const normalized = normalizeHex(raw);
    if (normalized) {
      emitColor(hexToHsv(normalized));
    }
  };

  const handlePreset = (hex) => {
    emitColor(hexToHsv(hex));
  };

  const preview = hsvToHex(hsv.h, hsv.s, hsv.v) || safeValue;

  const popover =
    open &&
    mounted &&
    createPortal(
      <div
        ref={popoverRef}
        role="dialog"
        aria-label={ariaLabel}
        className="fixed z-50 nx-card rounded-xl shadow-[var(--nx-shadow-md)] p-3 animate-fade-in"
        style={{
          top: position.placement === "bottom" ? position.top : undefined,
          bottom: position.placement === "top" ? window.innerHeight - position.top : undefined,
          left: position.left,
          width: POPOVER_WIDTH,
        }}
      >
        <div
          className="relative w-full h-36 rounded-lg cursor-crosshair touch-none select-none overflow-hidden"
          style={{ backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }}
          onPointerDown={handleSvDrag}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
          <div
            className="absolute w-4 h-4 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)] pointer-events-none"
            style={{
              left: `${hsv.s}%`,
              top: `${100 - hsv.v}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>

        <div
          className="relative mt-3 h-3 rounded-full cursor-pointer touch-none select-none"
          style={{
            background:
              "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
          }}
          onPointerDown={handleHueDrag}
        >
          <div
            className="absolute top-1/2 w-4 h-4 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)] pointer-events-none"
            style={{
              left: `${(hsv.h / 360) * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-lg border border-[var(--nx-border-strong)] shrink-0"
            style={{ backgroundColor: preview }}
          />
          <input
            type="text"
            value={hexInput}
            onChange={(e) => handleHexChange(e.target.value)}
            className="nx-input !h-9 flex-1 font-mono text-xs uppercase"
            spellCheck={false}
            aria-label="Hex color value"
          />
        </div>

        <div className="mt-3 grid grid-cols-9 gap-1.5">
          {PRESETS.map((hex) => (
            <button
              key={hex}
              type="button"
              onClick={() => handlePreset(hex)}
              className={cn(
                "aspect-square rounded-md border transition-transform hover:scale-110",
                preview === hex
                  ? "ring-2 ring-[var(--nx-accent)] ring-offset-1 ring-offset-[var(--nx-bg-surface)]"
                  : "border-[var(--nx-border-strong)]"
              )}
              style={{ backgroundColor: hex }}
              aria-label={hex}
            />
          ))}
        </div>
      </div>,
      document.body
    );

  return (
    <div ref={rootRef} className={cn("relative shrink-0", className)}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          "w-10 h-10 rounded-lg border border-[var(--nx-border-strong)] transition-all",
          open && "ring-[3px] ring-[var(--nx-accent-soft)] border-[var(--nx-accent)]",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        style={{ backgroundColor: safeValue }}
      />
      {popover}
    </div>
  );
}
