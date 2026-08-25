import config from "@/settings/config.json";

export function getDeveloperIds() {
  const raw = config.bot?.developer;
  if (raw == null || raw === "") return [];
  return (Array.isArray(raw) ? raw : [raw]).map(String).filter(Boolean);
}

export function isDeveloper(userId) {
  if (userId == null || userId === "") return false;
  return getDeveloperIds().includes(String(userId));
}
