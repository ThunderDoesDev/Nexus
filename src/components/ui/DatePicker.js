import { useState, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronLeft, ChevronRight, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Dropdown from "@/components/ui/Dropdown";
import {
  MONTH_NAMES,
  DAY_NAMES,
  getCalendarDays,
  normalizeMonthYear,
  parseLocalDatetime,
  parseLocalDate,
  toLocalDatetimeString,
  toLocalDateString,
  isSameDay,
  formatDisplay,
  to12Hour,
  to24Hour,
} from "@/lib/datetime";

const POPOVER_WIDTH = 320;
const POPOVER_EST_HEIGHT = 480;
const GAP = 8;

function cellToDate(cell) {
  const { month, year } = normalizeMonthYear(cell.month, cell.year);
  return new Date(year, month, cell.day);
}

export default function DatePicker({
  value = "",
  onChange,
  includeTime = true,
  placeholder = "Pick a date & time",
  className,
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: POPOVER_WIDTH, placement: "bottom" });

  const parsed = includeTime ? parseLocalDatetime(value) : parseLocalDate(value);
  const initial = parsed || new Date();

  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [hour12, setHour12] = useState(() => to12Hour(parsed ? parsed.getHours() : 12).hour12);
  const [minutes, setMinutes] = useState(parsed ? parsed.getMinutes() : 0);
  const [period, setPeriod] = useState(() => to12Hour(parsed ? parsed.getHours() : 12).period);

  const hour24 = to24Hour(hour12, period);

  const syncTimeFromDate = (d) => {
    const { hour12: h, period: p } = to12Hour(d.getHours());
    setHour12(h);
    setMinutes(d.getMinutes());
    setPeriod(p);
  };

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const d = (includeTime ? parseLocalDatetime(value) : parseLocalDate(value)) || new Date();
    setViewMonth(d.getMonth());
    setViewYear(d.getFullYear());
    if (includeTime) syncTimeFromDate(d);
  }, [open, value, includeTime]);

  const updatePosition = () => {
    const el = triggerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const popoverH = popoverRef.current?.offsetHeight || POPOVER_EST_HEIGHT;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const placement =
      spaceBelow >= popoverH + GAP || spaceBelow >= spaceAbove ? "bottom" : "top";

    const width = Math.min(POPOVER_WIDTH, window.innerWidth - 16);
    let left = rect.left;
    left = Math.max(8, Math.min(left, window.innerWidth - width - 8));

    const top = placement === "bottom" ? rect.bottom + GAP : rect.top - GAP;

    setPosition({ top, left, width, placement });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const id = requestAnimationFrame(updatePosition);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, viewMonth, viewYear, includeTime]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      const target = e.target;
      if (
        rootRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const today = useMemo(() => new Date(), [open]);
  const cells = useMemo(() => getCalendarDays(viewYear, viewMonth), [viewYear, viewMonth]);

  const shiftMonth = (delta) => {
    const next = normalizeMonthYear(viewMonth + delta, viewYear);
    setViewMonth(next.month);
    setViewYear(next.year);
  };

  const applyTimeToDate = (date) => {
    date.setHours(hour24, minutes, 0, 0);
    return date;
  };

  const emit = (date) => {
    if (includeTime) {
      onChange?.(toLocalDatetimeString(applyTimeToDate(date)));
    } else {
      onChange?.(toLocalDateString(date));
    }
  };

  const selectDay = (cell) => {
    emit(cellToDate(cell));
    if (!includeTime) setOpen(false);
  };

  const commitTime = (overrides = {}) => {
    const h12 = overrides.hour12 ?? hour12;
    const min = overrides.minutes ?? minutes;
    const p = overrides.period ?? period;
    const h24 = to24Hour(h12, p);

    let base;
    if (parsed) {
      base = new Date(parsed);
    } else {
      const day =
        viewMonth === today.getMonth() && viewYear === today.getFullYear()
          ? today.getDate()
          : 1;
      base = new Date(viewYear, viewMonth, day);
    }
    base.setHours(h24, min, 0, 0);
    onChange?.(toLocalDatetimeString(base));
  };

  const updateHour12 = (h) => {
    setHour12(h);
    commitTime({ hour12: h });
  };

  const updateMinutes = (m) => {
    setMinutes(m);
    commitTime({ minutes: m });
  };

  const updatePeriod = (p) => {
    setPeriod(p);
    commitTime({ period: p });
  };

  const setNow = () => {
    const now = new Date();
    onChange?.(includeTime ? toLocalDatetimeString(now) : toLocalDateString(now));
    setOpen(false);
  };

  const clear = (e) => {
    e.stopPropagation();
    onChange?.("");
    setOpen(false);
  };

  const popover = open && mounted && (
    <div
      ref={popoverRef}
      role="listbox"
      aria-label="Date picker"
      className="fixed z-50 nx-card rounded-xl shadow-[var(--nx-shadow-md)] overflow-x-hidden overflow-y-auto animate-fade-in max-h-[min(70vh,480px)]"
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
        transform: position.placement === "top" ? "translateY(-100%)" : "none",
      }}
    >
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--nx-border)] bg-[var(--nx-bg-raised)]">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="p-1.5 rounded-lg hover:bg-white/5 text-[var(--nx-text-muted)] hover:text-[var(--nx-text)] transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-[var(--nx-text-heading)]">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="p-1.5 rounded-lg hover:bg-white/5 text-[var(--nx-text-muted)] hover:text-[var(--nx-text)] transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 bg-[var(--nx-bg-surface)]">
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {DAY_NAMES.map((d) => (
                <div
                  key={d}
                  className="text-center text-[10px] font-bold uppercase tracking-wide text-[var(--nx-text-faint)] py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {cells.map((cell, i) => {
                const date = cellToDate(cell);
                const selected = parsed && isSameDay(date, parsed);
                const isToday = isSameDay(date, today);

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => selectDay(cell)}
                    className={cn(
                      "h-9 rounded-lg text-sm font-medium transition-all",
                      !cell.current && "text-[var(--nx-text-faint)] opacity-40",
                      cell.current && !selected && "text-[var(--nx-text)] hover:bg-[var(--nx-accent-soft)]",
                      selected && "bg-[var(--nx-accent)] text-white",
                      isToday && !selected && "ring-1 ring-[var(--nx-border-accent)]"
                    )}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>

            {includeTime && (
              <div className="mt-3 pt-3 border-t border-[var(--nx-border)]">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-3.5 h-3.5 text-[var(--nx-accent)]" />
                  <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--nx-text-muted)]">
                    Time
                  </span>
                </div>

                <div className="flex items-center justify-center gap-2 mb-3">
                  <Dropdown
                    value={hour12}
                    onChange={updateHour12}
                    options={Array.from({ length: 12 }, (_, i) => ({
                      value: i + 1,
                      label: String(i + 1),
                    }))}
                    className="w-16"
                    align="center"
                    compact
                    aria-label="Hour"
                  />
                  <span className="text-[var(--nx-text-heading)] font-bold text-lg leading-none">:</span>
                  <Dropdown
                    value={minutes}
                    onChange={updateMinutes}
                    options={Array.from({ length: 60 }, (_, m) => ({
                      value: m,
                      label: String(m).padStart(2, "0"),
                    }))}
                    className="w-16"
                    align="center"
                    compact
                    aria-label="Minute"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2" role="group" aria-label="AM or PM">
                  {(["AM", "PM"]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => updatePeriod(p)}
                      className={cn(
                        "h-10 rounded-lg text-sm font-bold border transition-all",
                        period === p
                          ? "bg-[var(--nx-accent)] border-[var(--nx-accent)] text-white"
                          : "bg-[var(--nx-bg-input)] border-[var(--nx-border-strong)] text-[var(--nx-text-heading)] hover:border-[var(--nx-border-accent)] hover:bg-[var(--nx-accent-soft)]"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--nx-border)]">
              <button
                type="button"
                onClick={setNow}
                className="flex-1 h-8 rounded-lg text-xs font-semibold bg-[var(--nx-bg-overlay)] hover:bg-[var(--nx-bg-raised)] text-[var(--nx-text)] border border-[var(--nx-border)] transition-colors"
              >
                {includeTime ? "Now" : "Today"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 h-8 rounded-lg text-xs font-semibold bg-[var(--nx-accent-soft)] hover:bg-[var(--nx-accent)]/20 text-[var(--nx-accent)] border border-[var(--nx-border-accent)] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
    </div>
  );

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "nx-input !h-10 w-full flex items-center gap-2.5 text-left transition-colors",
          open && "border-[var(--nx-accent)] ring-[3px] ring-[var(--nx-accent-soft)]"
        )}
      >
        <Calendar className="w-4 h-4 shrink-0 text-[var(--nx-accent)]" />
        <span className={cn("flex-1 truncate text-sm", !value && "text-[var(--nx-text-faint)]")}>
          {value ? formatDisplay(value, includeTime) : placeholder}
        </span>
        {value && (
          <span
            role="button"
            tabIndex={0}
            onClick={clear}
            onKeyDown={(e) => e.key === "Enter" && clear(e)}
            className="p-0.5 rounded hover:bg-white/10 text-[var(--nx-text-faint)] hover:text-[var(--nx-text)]"
            aria-label="Clear date"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        )}
      </button>
      {popover && createPortal(popover, document.body)}
    </div>
  );
}
