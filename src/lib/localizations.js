/** Discord locale codes for application command localizations. */

export const DISCORD_LOCALES = [
  { code: "id", label: "Indonesian" },
  { code: "da", label: "Danish" },
  { code: "de", label: "German" },
  { code: "en-GB", label: "English (UK)" },
  { code: "en-US", label: "English (US)" },
  { code: "es-ES", label: "Spanish (Spain)" },
  { code: "es-419", label: "Spanish (LATAM)" },
  { code: "fr", label: "French" },
  { code: "hr", label: "Croatian" },
  { code: "it", label: "Italian" },
  { code: "lt", label: "Lithuanian" },
  { code: "hu", label: "Hungarian" },
  { code: "nl", label: "Dutch" },
  { code: "no", label: "Norwegian" },
  { code: "pl", label: "Polish" },
  { code: "pt-BR", label: "Portuguese (Brazil)" },
  { code: "ro", label: "Romanian" },
  { code: "fi", label: "Finnish" },
  { code: "sv-SE", label: "Swedish" },
  { code: "vi", label: "Vietnamese" },
  { code: "tr", label: "Turkish" },
  { code: "cs", label: "Czech" },
  { code: "el", label: "Greek" },
  { code: "bg", label: "Bulgarian" },
  { code: "ru", label: "Russian" },
  { code: "uk", label: "Ukrainian" },
  { code: "hi", label: "Hindi" },
  { code: "th", label: "Thai" },
  { code: "zh-CN", label: "Chinese (China)" },
  { code: "ja", label: "Japanese" },
  { code: "zh-TW", label: "Chinese (Taiwan)" },
  { code: "ko", label: "Korean" },
];

let uid = 0;
export const nextLocId = () => `loc_${++uid}_${Date.now()}`;

export function emptyLocaleRow(code = "en-US") {
  return { id: nextLocId(), code, name: "", description: "" };
}

export function createExampleLocalizations() {
  return {
    baseName: "ping",
    baseDescription: "Check if the bot is online",
    rows: [
      { ...emptyLocaleRow("en-US"), name: "ping", description: "Check if the bot is online" },
      { ...emptyLocaleRow("es-ES"), name: "ping", description: "Comprueba si el bot está en línea" },
      { ...emptyLocaleRow("fr"), name: "ping", description: "Vérifie si le bot est en ligne" },
      { ...emptyLocaleRow("de"), name: "ping", description: "Prüft, ob der Bot online ist" },
      { ...emptyLocaleRow("ja"), name: "ping", description: "ボットがオンラインか確認" },
    ],
  };
}

export function buildLocalizationMaps(rows) {
  const name_localizations = {};
  const description_localizations = {};

  for (const row of rows || []) {
    if (!row.code) continue;
    if (row.name?.trim()) name_localizations[row.code] = row.name.trim().slice(0, 32);
    if (row.description?.trim()) {
      description_localizations[row.code] = row.description.trim().slice(0, 100);
    }
  }

  return { name_localizations, description_localizations };
}

export function buildLocalizedCommand({ baseName, baseDescription, rows }) {
  const maps = buildLocalizationMaps(rows);
  const command = {
    name: (baseName || "command").trim().slice(0, 32),
    description: (baseDescription || "Description").trim().slice(0, 100),
    type: 1,
  };
  if (Object.keys(maps.name_localizations).length) {
    command.name_localizations = maps.name_localizations;
  }
  if (Object.keys(maps.description_localizations).length) {
    command.description_localizations = maps.description_localizations;
  }
  return command;
}

export function parseLocalizationJson(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([, v]) => typeof v === "string" && v.trim())
        .map(([k, v]) => [k, v.trim()])
    );
  } catch {
    return null;
  }
}
