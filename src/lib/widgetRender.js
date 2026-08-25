import { deriveAccentPalette, normalizeHex } from "./colors";

export { deriveAccentPalette } from "./colors";

export const WIDGET_STYLES = [
  { id: "card", label: "Card" },
  { id: "compact", label: "Compact" },
  { id: "banner", label: "Banner" },
];

/** Matches site GRADIENTS in ThemeContext / globals.css */
export const WIDGET_THEMES = [
  {
    id: "signal",
    label: "Signal",
    accent: "#0d9488",
    accentMid: "#2dd4bf",
    cyan: "#22d3ee",
    meshA: "#0d9488",
    meshB: "#22d3ee",
    meshC: "#64748b",
    preview: "linear-gradient(135deg, #0d9488, #2dd4bf, #22d3ee)",
    bg: "#0f141c",
    surface: "#161d28",
    raised: "#1c2533",
    text: "#f4f7fb",
    muted: "#8b97a8",
    border: "rgba(220, 235, 255, 0.10)",
  },
  {
    id: "forge",
    label: "Forge",
    accent: "#c2410c",
    accentMid: "#fb923c",
    cyan: "#f59e0b",
    meshA: "#c2410c",
    meshB: "#f59e0b",
    meshC: "#78716c",
    preview: "linear-gradient(135deg, #c2410c, #fb923c, #f59e0b)",
    bg: "#140f0c",
    surface: "#1c1612",
    raised: "#241c16",
    text: "#fff7ed",
    muted: "#a8a29e",
    border: "rgba(255, 237, 213, 0.10)",
  },
  {
    id: "moss",
    label: "Moss",
    accent: "#15803d",
    accentMid: "#4ade80",
    cyan: "#14b8a6",
    meshA: "#15803d",
    meshB: "#14b8a6",
    meshC: "#64748b",
    preview: "linear-gradient(135deg, #15803d, #4ade80, #14b8a6)",
    bg: "#0c1410",
    surface: "#121a15",
    raised: "#1a2420",
    text: "#f0fdf4",
    muted: "#86a395",
    border: "rgba(220, 252, 231, 0.10)",
  },
  {
    id: "tide",
    label: "Tide",
    accent: "#0369a1",
    accentMid: "#0ea5e9",
    cyan: "#38bdf8",
    meshA: "#0369a1",
    meshB: "#38bdf8",
    meshC: "#64748b",
    preview: "linear-gradient(135deg, #0369a1, #0ea5e9, #38bdf8)",
    bg: "#0b1220",
    surface: "#111827",
    raised: "#1a2336",
    text: "#f0f9ff",
    muted: "#94a3b8",
    border: "rgba(224, 242, 254, 0.10)",
  },
  {
    id: "ink",
    label: "Ink",
    accent: "#94a3b8",
    accentMid: "#cbd5e1",
    cyan: "#0d9488",
    meshA: "#334155",
    meshB: "#64748b",
    meshC: "#0d9488",
    preview: "linear-gradient(135deg, #334155, #64748b, #0d9488)",
    bg: "#0a0e14",
    surface: "#121821",
    raised: "#1c2533",
    text: "#f4f7fb",
    muted: "#8b97a8",
    border: "rgba(220, 235, 255, 0.10)",
  },
];

const LEGACY_THEME_MAP = {
  light: "signal",
  blurple: "signal",
  sunset: "forge",
  ocean: "tide",
  aurora: "moss",
  ember: "forge",
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function resolveTheme(themeId, accentOverride) {
  const id = LEGACY_THEME_MAP[themeId] || themeId;
  const base = WIDGET_THEMES.find((t) => t.id === id) || WIDGET_THEMES[0];
  const custom = deriveAccentPalette(accentOverride);
  const theme = custom ? { ...base, ...custom } : base;
  const accent = theme.accent;
  return {
    ...theme,
    accent,
    gradient: `linear-gradient(135deg, ${accent} 0%, ${theme.accentMid} 55%, ${theme.cyan} 100%)`,
    barGradient: `linear-gradient(90deg, ${accent}, ${theme.accentMid}, ${theme.cyan})`,
    buttonGradient: `linear-gradient(145deg, ${accent} 0%, ${theme.accentMid} 100%)`,
    meshBackground: `
      radial-gradient(ellipse 80% 60% at 12% 0%, ${theme.meshA}33, transparent 55%),
      radial-gradient(ellipse 70% 50% at 100% 10%, ${theme.meshB}28, transparent 50%),
      radial-gradient(ellipse 60% 40% at 50% 120%, ${theme.meshC}22, transparent 55%),
      linear-gradient(165deg, ${theme.raised} 0%, ${theme.surface} 100%)
    `,
  };
}

function radiusFor(type) {
  return type === "user" || type === "app" ? "999px" : "16px";
}

function avatarHtml({ image, type, theme, size, ring = false }) {
  const r = radiusFor(type);
  const ringW = 3;
  const pad = ring ? ringW + 1 : 0;
  const wrap = size + pad * 2;
  const outline = ring ? `box-shadow:0 0 0 ${ringW}px ${theme.surface};` : "";

  return `<div style="position:relative;width:${wrap}px;height:${wrap}px;flex-shrink:0;display:flex;align-items:center;justify-content:center;">
    <img src="${image}" alt="" width="${size}" height="${size}" style="width:${size}px;height:${size}px;border-radius:${r};object-fit:cover;background:${theme.bg};${outline}" />
  </div>`;
}

export function estimateWidgetHeight(style) {
  if (style === "compact") return 96;
  if (style === "banner") return 340;
  return 280;
}

export function buildWidgetHtml(entity, options = {}) {
  const style = options.style || "card";
  const accentOverride = "accent" in options ? options.accent : entity?.accentColor;
  const theme = resolveTheme(options.theme || "signal", accentOverride);
  const image = escapeHtml(entity?.imageUrl || "");
  const banner = escapeHtml(entity?.bannerUrl || "");
  const name = escapeHtml(entity?.name || "Unknown");
  const subtitle = escapeHtml(entity?.username || "");
  const description = escapeHtml(entity?.description || "");
  const badge = escapeHtml(entity?.badge || "");
  const linkUrl = escapeHtml(entity?.linkUrl || "");
  const linkLabel = escapeHtml(entity?.linkLabel || "Open");
  const type = entity?.type || "app";
  const stats = Array.isArray(entity?.stats) ? entity.stats.slice(0, 2) : [];
  const badgeIcons = Array.isArray(entity?.badges)
    ? entity.badges.filter((b) => b && (b.iconUrl || typeof b === "string"))
    : [];

  const badgeIconsHtml = badgeIcons.length
    ? `<div style="display:inline-flex;align-items:center;gap:4px;flex-wrap:wrap;margin-left:2px;">
        ${badgeIcons
          .map((b) => {
            const src = escapeHtml(typeof b === "string" ? "" : b.iconUrl || "");
            const title = escapeHtml(typeof b === "string" ? b : b.name || b.id || "Badge");
            if (!src) return "";
            return `<img src="${src}" alt="${title}" title="${title}" width="20" height="20" style="width:20px;height:20px;object-fit:contain;flex-shrink:0;" />`;
          })
          .join("")}
      </div>`
    : "";

  const badgeHtml = !badgeIconsHtml && badge
    ? `<span style="display:inline-flex;align-items:center;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;background:${theme.accent}22;color:${theme.accent};border:1px solid ${theme.accent}55;">${badge}</span>`
    : badgeIconsHtml;

  const statsHtml = stats.length
    ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px;">
        ${stats
          .map(
            (stat) => `<div style="background:${theme.bg};border:1px solid rgba(127,127,127,0.12);border-radius:10px;padding:10px 12px;">
            <div style="font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${theme.muted};">${escapeHtml(stat.label)}</div>
            <div style="font-size:16px;font-weight:800;color:${theme.text};margin-top:2px;word-break:break-word;">${escapeHtml(stat.value)}</div>
          </div>`
          )
          .join("")}
      </div>`
    : "";

  const linkHtml = linkUrl
    ? `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;justify-content:center;margin-top:14px;height:36px;padding:0 14px;border-radius:10px;background:${theme.buttonGradient};color:#fff;font-size:13px;font-weight:700;text-decoration:none;">${linkLabel}</a>`
    : "";

  let inner = "";

  if (style === "compact") {
    inner = `
      <div style="display:flex;align-items:center;gap:12px;">
        ${avatarHtml({ image, type, theme, size: 48 })}
        <div style="min-width:0;flex:1;">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <div style="font-size:15px;font-weight:800;color:${theme.text};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${name}</div>
            ${badgeHtml}
          </div>
          ${subtitle ? `<div style="font-size:12px;color:${theme.muted};margin-top:2px;">${subtitle}</div>` : ""}
        </div>
        ${
          linkUrl
            ? `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" style="flex-shrink:0;height:32px;padding:0 12px;border-radius:8px;background:${theme.buttonGradient};color:#fff;font-size:12px;font-weight:700;text-decoration:none;display:inline-flex;align-items:center;">${linkLabel}</a>`
            : ""
        }
      </div>`;
  } else if (style === "banner") {
    inner = `
      <div style="position:relative;margin:-18px -18px 14px;height:96px;background:${theme.gradient};overflow:hidden;">
        ${banner ? `<img src="${banner}" alt="" style="width:100%;height:100%;object-fit:cover;" />` : ""}
        <div style="position:absolute;inset:0;background:linear-gradient(to top, ${theme.surface}, transparent 70%);"></div>
      </div>
      <div style="display:flex;align-items:flex-end;gap:14px;margin-top:-40px;position:relative;">
        ${avatarHtml({ image, type, theme, size: 72, ring: true })}
        <div style="min-width:0;padding-bottom:4px;">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:2px;">
            <div style="font-size:20px;font-weight:800;color:${theme.text};">${name}</div>
            ${badgeHtml}
          </div>
          ${subtitle ? `<div style="font-size:13px;color:${theme.muted};margin-top:2px;">${subtitle}</div>` : ""}
        </div>
      </div>
      ${description ? `<p style="margin:14px 0 0;font-size:13px;line-height:1.5;color:${theme.muted};">${description}</p>` : ""}
      ${statsHtml}
      ${linkHtml}`;
  } else {
    inner = `
      <div style="display:flex;align-items:flex-start;gap:14px;">
        ${avatarHtml({ image, type, theme, size: 64 })}
        <div style="min-width:0;flex:1;">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:2px;">
            <div style="font-size:18px;font-weight:800;color:${theme.text};">${name}</div>
            ${badgeHtml}
          </div>
          ${subtitle ? `<div style="font-size:13px;color:${theme.muted};margin-top:2px;">${subtitle}</div>` : ""}
        </div>
      </div>
      ${description ? `<p style="margin:14px 0 0;font-size:13px;line-height:1.5;color:${theme.muted};">${description}</p>` : ""}
      ${statsHtml}
      ${linkHtml}`;
  }

  const card = `
    <div class="nx-widget" style="
      box-sizing:border-box;width:100%;max-width:420px;
      font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
      background:${theme.meshBackground};color:${theme.text};
      border:1px solid ${theme.border};border-radius:16px;padding:18px;
      box-shadow:0 12px 40px rgba(0,0,0,0.22);overflow:hidden;
    ">
      <div style="height:3px;margin:-18px -18px 16px;background:${theme.barGradient};"></div>
      ${inner}
    </div>`;

  if (options.standalone === false) return card.trim();

  const refreshMs = Number(options.refreshMs) > 0 ? Number(options.refreshMs) : 60000;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${name} — Nexus Widget</title>
  <style>html,body{margin:0;padding:0;background:transparent}body{display:flex;justify-content:center}*{box-sizing:border-box}</style>
</head>
<body>
${card}
<script>
(function () {
  var ms = ${refreshMs};
  setTimeout(function () {
    try {
      var url = new URL(window.location.href);
      url.searchParams.set("t", String(Date.now()));
      window.location.replace(url.toString());
    } catch (e) {}
  }, ms);
})();
</script>
</body>
</html>`;
}

/** Unix-ms cache buster so embeds can refresh profile data. */
export function widgetCacheTimestamp(now = Date.now()) {
  return String(Math.floor(Number(now) || Date.now()));
}

export function buildWidgetEmbedSnippet({ type, id, style, theme, accent, t }, origin = "") {
  const params = new URLSearchParams();
  params.set("type", type);
  params.set("id", id);
  if (style) params.set("style", style);
  if (theme) params.set("theme", theme);
  const accentHex = normalizeHex(accent || "");
  if (accentHex) params.set("accent", accentHex.replace(/^#/, ""));
  params.set("t", t || widgetCacheTimestamp());

  const height = estimateWidgetHeight(style);
  const src = `${origin}/api/widget?${params.toString()}`;

  return `<iframe
  src="${src}"
  width="420"
  height="${height}"
  allowtransparency="true"
  frameborder="0"
  sandbox="allow-popups allow-popups-to-escape-sandbox allow-scripts"
  style="border:none;border-radius:16px;max-width:100%;"
  title="Nexus ${type} widget"
></iframe>`;
}
