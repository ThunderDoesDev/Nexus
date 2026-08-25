export function decimalToHex(decimal) {
  const num = parseInt(decimal, 10);
  if (isNaN(num) || num < 0 || num > 16777215) return null;
  return `#${num.toString(16).padStart(6, "0")}`;
}

export function hexToDecimal(hex) {
  const cleaned = hex.replace(/^#/, "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return null;
  return parseInt(cleaned, 16);
}

export function rgbToDecimal(r, g, b) {
  if ([r, g, b].some((v) => v < 0 || v > 255 || isNaN(v))) return null;
  return (r << 16) + (g << 8) + b;
}

export function decimalToRgb(decimal) {
  const num = parseInt(decimal, 10);
  if (isNaN(num) || num < 0 || num > 16777215) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function normalizeHex(hex) {
  if (hex == null || typeof hex !== "string") return null;
  const cleaned = hex.replace(/^#/, "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return null;
  return `#${cleaned.toLowerCase()}`;
}

export function hexToRgb(hex) {
  const rgb = decimalToRgb(hexToDecimal(hex));
  return rgb;
}

export function rgbToHex(r, g, b) {
  const d = rgbToDecimal(r, g, b);
  if (d === null) return null;
  return decimalToHex(d);
}

export function rgbToHsv(r, g, b) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  const s = max === 0 ? 0 : (delta / max) * 100;
  const v = max * 100;

  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta + (gn < bn ? 6 : 0)) * 60;
    else if (max === gn) h = ((bn - rn) / delta + 2) * 60;
    else h = ((rn - gn) / delta + 4) * 60;
  }

  return { h, s, v };
}

export function hsvToRgb(h, s, v) {
  const sn = s / 100;
  const vn = v / 100;
  const c = vn * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = vn - c;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

export function hsvToHex(h, s, v) {
  const rgb = hsvToRgb(h, s, v);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

export function hexToHsv(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return { h: 235, s: 64, v: 95 };
  return rgbToHsv(rgb.r, rgb.g, rgb.b);
}

export function hexToRgba(hex, alpha = 1) {
  const rgb = hexToRgb(normalizeHex(hex) || hex);
  if (!rgb) return null;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/** Build mid/cyan stops from a single accent so custom gradients stay cohesive. */
export function deriveAccentPalette(hex) {
  const accent = normalizeHex(hex);
  if (!accent) return null;
  const hsv = hexToHsv(accent);
  const accentMid =
    hsvToHex(hsv.h, Math.min(100, Math.max(28, hsv.s * 0.78)), Math.min(100, hsv.v + 16)) || accent;
  const cyan =
    hsvToHex((hsv.h + 28) % 360, Math.min(100, Math.max(30, hsv.s * 0.72)), Math.min(100, hsv.v + 10)) ||
    accentMid;
  const accentHover =
    hsvToHex(hsv.h, Math.min(100, hsv.s * 1.05), Math.max(18, hsv.v - 14)) || accent;
  return {
    accent,
    accentMid,
    accentHover,
    cyan,
    meshA: accent,
    meshB: cyan,
    meshC: "#64748b",
    preview: `linear-gradient(135deg, ${accent}, ${accentMid}, ${cyan})`,
  };
}

const CUSTOM_CSS_VARS = [
  "--nx-accent",
  "--nx-accent-hover",
  "--nx-accent-soft",
  "--nx-accent-glow",
  "--nx-border-accent",
  "--nx-pink",
  "--nx-cyan",
  "--nx-accent-mid",
  "--nx-ambient-1",
  "--nx-ambient-2",
  "--nx-ambient-3",
  "--nx-shadow-glow",
  "--nx-modal-glow",
  "--nx-selection-bg",
  "--nx-mesh-a",
  "--nx-mesh-b",
  "--nx-mesh-c",
  "--nx-badge-text",
];

/** CSS custom properties for data-gradient="custom". */
export function buildCustomGradientVars(hex) {
  const palette = deriveAccentPalette(hex);
  if (!palette) return null;
  return {
    "--nx-accent": palette.accent,
    "--nx-accent-hover": palette.accentHover,
    "--nx-accent-soft": hexToRgba(palette.accent, 0.12),
    "--nx-accent-glow": hexToRgba(palette.accent, 0.32),
    "--nx-border-accent": hexToRgba(palette.accent, 0.38),
    "--nx-pink": palette.accentMid,
    "--nx-cyan": palette.cyan,
    "--nx-accent-mid": palette.accentMid,
    "--nx-ambient-1": hexToRgba(palette.accent, 0.16),
    "--nx-ambient-2": hexToRgba(palette.cyan, 0.1),
    "--nx-ambient-3": hexToRgba(palette.meshC, 0.06),
    "--nx-shadow-glow": `0 0 48px ${hexToRgba(palette.accent, 0.1)}`,
    "--nx-modal-glow": hexToRgba(palette.accent, 0.12),
    "--nx-selection-bg": hexToRgba(palette.accent, 0.22),
    "--nx-mesh-a": palette.meshA,
    "--nx-mesh-b": palette.meshB,
    "--nx-mesh-c": palette.meshC,
    "--nx-badge-text": palette.accentMid,
  };
}

export function applyCustomGradientVars(hex, root = typeof document !== "undefined" ? document.documentElement : null) {
  if (!root) return false;
  const vars = buildCustomGradientVars(hex);
  if (!vars) return false;
  Object.entries(vars).forEach(([key, value]) => {
    if (value) root.style.setProperty(key, value);
  });
  return true;
}

export function clearCustomGradientVars(root = typeof document !== "undefined" ? document.documentElement : null) {
  if (!root) return;
  CUSTOM_CSS_VARS.forEach((key) => root.style.removeProperty(key));
}
