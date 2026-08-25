import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  applyCustomGradientVars,
  clearCustomGradientVars,
  deriveAccentPalette,
  normalizeHex,
} from "@/lib/colors";

const STORAGE_KEY = "nexus-theme";
export const DEFAULT_CUSTOM_ACCENT = "#5865f2";

export const THEME_MODES = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "system", label: "System" },
];

export const GRADIENTS = [
  { id: "signal", label: "Signal", preview: "linear-gradient(135deg, #0d9488, #2dd4bf, #22d3ee)" },
  { id: "forge", label: "Forge", preview: "linear-gradient(135deg, #c2410c, #fb923c, #f59e0b)" },
  { id: "moss", label: "Moss", preview: "linear-gradient(135deg, #15803d, #4ade80, #14b8a6)" },
  { id: "tide", label: "Tide", preview: "linear-gradient(135deg, #0369a1, #0ea5e9, #38bdf8)" },
  { id: "ink", label: "Ink", preview: "linear-gradient(135deg, #334155, #64748b, #0d9488)" },
  { id: "custom", label: "Custom" },
];

const PRESET_GRADIENT_IDS = new Set(GRADIENTS.filter((g) => g.id !== "custom").map((g) => g.id));

const LEGACY_GRADIENTS = {
  blurple: "signal",
  sunset: "forge",
  ocean: "tide",
  aurora: "moss",
  ember: "forge",
};

const ThemeContext = createContext(null);

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(mode) {
  return mode === "system" ? getSystemTheme() : mode;
}

function normalizeGradient(id) {
  if (id === "custom" || PRESET_GRADIENT_IDS.has(id)) return id;
  return LEGACY_GRADIENTS[id] || "signal";
}

function readStoredTheme() {
  if (typeof window === "undefined") {
    return { mode: "system", gradient: "signal", customAccent: DEFAULT_CUSTOM_ACCENT };
  }
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      mode: THEME_MODES.some((m) => m.id === stored.mode) ? stored.mode : "system",
      gradient: normalizeGradient(stored.gradient),
      customAccent: normalizeHex(stored.customAccent) || DEFAULT_CUSTOM_ACCENT,
    };
  } catch {
    return { mode: "system", gradient: "signal", customAccent: DEFAULT_CUSTOM_ACCENT };
  }
}

function applyTheme(mode, gradient, customAccent) {
  const resolved = resolveTheme(mode);
  document.documentElement.setAttribute("data-theme", resolved);
  document.documentElement.setAttribute("data-gradient", gradient);

  if (gradient === "custom") {
    applyCustomGradientVars(customAccent || DEFAULT_CUSTOM_ACCENT);
  } else {
    clearCustomGradientVars();
  }

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    const accent = getComputedStyle(document.documentElement).getPropertyValue("--nx-accent").trim();
    if (accent) meta.setAttribute("content", accent);
  }
}

export function customGradientPreview(hex) {
  return deriveAccentPalette(hex || DEFAULT_CUSTOM_ACCENT)?.preview
    || `linear-gradient(135deg, ${hex || DEFAULT_CUSTOM_ACCENT}, ${hex || DEFAULT_CUSTOM_ACCENT})`;
}

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState("system");
  const [gradient, setGradientState] = useState("signal");
  const [customAccent, setCustomAccentState] = useState(DEFAULT_CUSTOM_ACCENT);
  const [resolvedTheme, setResolvedTheme] = useState("light");

  useEffect(() => {
    const stored = readStoredTheme();
    setModeState(stored.mode);
    setGradientState(stored.gradient);
    setCustomAccentState(stored.customAccent);
    setResolvedTheme(resolveTheme(stored.mode));
    applyTheme(stored.mode, stored.gradient, stored.customAccent);
  }, []);

  useEffect(() => {
    applyTheme(mode, gradient, customAccent);
    setResolvedTheme(resolveTheme(mode));

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ mode, gradient, customAccent })
      );
    } catch {
      /* ignore quota errors */
    }
  }, [mode, gradient, customAccent]);

  useEffect(() => {
    if (mode !== "system") return undefined;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      applyTheme("system", gradient, customAccent);
      setResolvedTheme(getSystemTheme());
    };

    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode, gradient, customAccent]);

  const setMode = useCallback((next) => {
    setModeState(next);
  }, []);

  const setGradient = useCallback((next) => {
    setGradientState(normalizeGradient(next));
  }, []);

  const setCustomAccent = useCallback((hex) => {
    const next = normalizeHex(hex) || DEFAULT_CUSTOM_ACCENT;
    setCustomAccentState(next);
    setGradientState("custom");
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        gradient,
        customAccent,
        resolvedTheme,
        setMode,
        setGradient,
        setCustomAccent,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
