/**
 * Discord ANSI colored text (code block language: ansi).
 * Escape sequences Discord supports in ```ansi blocks.
 */

export const ANSI_COLORS = [
  { id: "gray", label: "Gray", code: 30, css: "#4f545c" },
  { id: "red", label: "Red", code: 31, css: "#dc322f" },
  { id: "green", label: "Green", code: 32, css: "#859900" },
  { id: "yellow", label: "Yellow", code: 33, css: "#b58900" },
  { id: "blue", label: "Blue", code: 34, css: "#268bd2" },
  { id: "pink", label: "Pink", code: 35, css: "#d33682" },
  { id: "cyan", label: "Cyan", code: 36, css: "#2aa198" },
  { id: "white", label: "White", code: 37, css: "#ffffff" },
];

export const ANSI_BG = [
  { id: "none", label: "None", code: null, css: "transparent" },
  { id: "dark-blue", label: "Dark Blue", code: 40, css: "#002b36" },
  { id: "orange", label: "Orange", code: 41, css: "#cb4b16" },
  { id: "gray", label: "Gray", code: 42, css: "#586e75" },
  { id: "light-gray", label: "Light Gray", code: 43, css: "#657b83" },
  { id: "lighter-gray", label: "Lighter Gray", code: 44, css: "#839496" },
  { id: "indigo", label: "Indigo", code: 45, css: "#6c71c4" },
  { id: "white", label: "White", code: 46, css: "#93a1a1" },
  { id: "white-bright", label: "Bright White", code: 47, css: "#fdf6e3" },
];

export function buildAnsiSegment({ text, color = 37, bg = null, bold = false, underline = false }) {
  const parts = [];
  if (bold) parts.push("1");
  if (underline) parts.push("4");
  if (color != null) parts.push(String(color));
  if (bg != null) parts.push(String(bg));
  const seq = parts.length ? `\u001b[${parts.join(";")}m` : "";
  return `${seq}${text}\u001b[0m`;
}

export function wrapAnsiCodeBlock(body) {
  return "```ansi\n" + String(body ?? "") + "\n```";
}

export function previewAnsiSegments(segments) {
  return segments.map((seg) => {
    const color = ANSI_COLORS.find((c) => c.code === seg.color)?.css || "#ffffff";
    const bg = ANSI_BG.find((b) => b.code === seg.bg)?.css || "transparent";
    return {
      text: seg.text,
      style: {
        color,
        backgroundColor: bg === "transparent" ? undefined : bg,
        fontWeight: seg.bold ? 700 : 400,
        textDecoration: seg.underline ? "underline" : "none",
      },
    };
  });
}
