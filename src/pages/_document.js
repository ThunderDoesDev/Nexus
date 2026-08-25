import { Html, Head, Main, NextScript } from "next/document";

const themeInitScript = `
(function() {
  try {
    var stored = JSON.parse(localStorage.getItem("nexus-theme") || "{}");
    var mode = stored.mode || "system";
    var gradient = stored.gradient || "signal";
    var legacy = { blurple: "signal", sunset: "forge", ocean: "tide", aurora: "moss", ember: "forge" };
    if (legacy[gradient]) gradient = legacy[gradient];
    var allowed = { signal: 1, forge: 1, moss: 1, tide: 1, ink: 1, custom: 1 };
    if (!allowed[gradient]) gradient = "signal";
    var resolved = mode === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : mode;
    var root = document.documentElement;
    root.setAttribute("data-theme", resolved);
    root.setAttribute("data-gradient", gradient);

    if (gradient === "custom") {
      var raw = String(stored.customAccent || "#5865f2").replace(/^#/, "").trim();
      if (!/^[0-9a-fA-F]{6}$/.test(raw)) raw = "5865f2";
      var accent = "#" + raw.toLowerCase();
      function hexToRgb(h) {
        var n = parseInt(h.slice(1), 16);
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
      }
      function rgbToHsv(r, g, b) {
        var rn = r / 255, gn = g / 255, bn = b / 255;
        var max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn), d = max - min;
        var h = 0, s = max === 0 ? 0 : (d / max) * 100, v = max * 100;
        if (d !== 0) {
          if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
          else if (max === gn) h = ((bn - rn) / d + 2) * 60;
          else h = ((rn - gn) / d + 4) * 60;
        }
        return { h: h, s: s, v: v };
      }
      function hsvToRgb(h, s, v) {
        var sn = s / 100, vn = v / 100, c = vn * sn;
        var x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        var m = vn - c, r = 0, g = 0, b = 0;
        if (h < 60) { r = c; g = x; }
        else if (h < 120) { r = x; g = c; }
        else if (h < 180) { g = c; b = x; }
        else if (h < 240) { g = x; b = c; }
        else if (h < 300) { r = x; b = c; }
        else { r = c; b = x; }
        return {
          r: Math.round((r + m) * 255),
          g: Math.round((g + m) * 255),
          b: Math.round((b + m) * 255)
        };
      }
      function toHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
      }
      function hsvToHex(h, s, v) {
        var rgb = hsvToRgb(h, s, v);
        return toHex(rgb.r, rgb.g, rgb.b);
      }
      function rgba(h, a) {
        var rgb = hexToRgb(h);
        return "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", " + a + ")";
      }
      var hsv = rgbToHsv(hexToRgb(accent).r, hexToRgb(accent).g, hexToRgb(accent).b);
      var mid = hsvToHex(hsv.h, Math.min(100, Math.max(28, hsv.s * 0.78)), Math.min(100, hsv.v + 16));
      var cyan = hsvToHex((hsv.h + 28) % 360, Math.min(100, Math.max(30, hsv.s * 0.72)), Math.min(100, hsv.v + 10));
      var hover = hsvToHex(hsv.h, Math.min(100, hsv.s * 1.05), Math.max(18, hsv.v - 14));
      var vars = {
        "--nx-accent": accent,
        "--nx-accent-hover": hover,
        "--nx-accent-soft": rgba(accent, 0.12),
        "--nx-accent-glow": rgba(accent, 0.32),
        "--nx-border-accent": rgba(accent, 0.38),
        "--nx-pink": mid,
        "--nx-cyan": cyan,
        "--nx-accent-mid": mid,
        "--nx-ambient-1": rgba(accent, 0.16),
        "--nx-ambient-2": rgba(cyan, 0.1),
        "--nx-ambient-3": rgba("#64748b", 0.06),
        "--nx-shadow-glow": "0 0 48px " + rgba(accent, 0.1),
        "--nx-modal-glow": rgba(accent, 0.12),
        "--nx-selection-bg": rgba(accent, 0.22),
        "--nx-mesh-a": accent,
        "--nx-mesh-b": cyan,
        "--nx-mesh-c": "#64748b",
        "--nx-badge-text": mid
      };
      for (var k in vars) root.style.setProperty(k, vars[k]);
    }
  } catch (e) {}
})();
`;

export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
