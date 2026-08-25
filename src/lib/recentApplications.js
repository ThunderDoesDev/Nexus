const STORAGE_KEY = "nexus-recent-applications";
const LEGACY_STORAGE_KEY = "nexus-recent-bots";
const MAX_RECENT = 8;

function readStored(key) {
  try {
    const stored = JSON.parse(localStorage.getItem(key) || "[]");
    if (!Array.isArray(stored)) return [];
    return stored.filter((entry) => entry?.id && entry?.name).slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

export function getRecentApplications() {
  if (typeof window === "undefined") return [];
  const current = readStored(STORAGE_KEY);
  if (current.length > 0) return current;

  const legacy = readStored(LEGACY_STORAGE_KEY);
  if (legacy.length > 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  }
  return legacy;
}

export function addRecentApplication(application) {
  if (typeof window === "undefined" || !application?.id || !application?.name) return;
  const entry = {
    id: application.id,
    name: application.name,
    description: application.description || "",
    icon: application.icon || null,
  };
  const updated = [entry, ...getRecentApplications().filter((item) => item.id !== entry.id)].slice(
    0,
    MAX_RECENT
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  localStorage.removeItem(LEGACY_STORAGE_KEY);
}

export function clearRecentApplications() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
}
