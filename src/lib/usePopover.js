import { useState, useRef, useEffect, useLayoutEffect } from "react";

const DEFAULT_GAP = 8;

export function usePopover({
  open,
  estimatedHeight = 240,
  estimatedWidth,
  matchTriggerWidth = true,
  gap = DEFAULT_GAP,
}) {
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, placement: "bottom" });

  useEffect(() => setMounted(true), []);

  const updatePosition = () => {
    const el = triggerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const popoverH = popoverRef.current?.offsetHeight || estimatedHeight;
    const popoverW =
      estimatedWidth ?? (matchTriggerWidth ? rect.width : popoverRef.current?.offsetWidth || 200);
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const placement = spaceBelow >= popoverH + gap || spaceBelow >= spaceAbove ? "bottom" : "top";

    const width = matchTriggerWidth
      ? Math.min(rect.width, window.innerWidth - 16)
      : Math.min(popoverW, window.innerWidth - 16);

    let left = rect.left;
    left = Math.max(8, Math.min(left, window.innerWidth - width - 8));

    const top = placement === "bottom" ? rect.bottom + gap : rect.top - gap;

    setPosition({ top, left, width, placement });
  };

  useLayoutEffect(() => {
    if (!open) return undefined;
    updatePosition();
    const id = requestAnimationFrame(updatePosition);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  return { mounted, rootRef, triggerRef, popoverRef, position, updatePosition };
}

export function usePopoverDismiss(open, setOpen, rootRef, popoverRef) {
  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (e) => {
      const target = e.target;
      if (rootRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
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
  }, [open, setOpen, rootRef, popoverRef]);
}
