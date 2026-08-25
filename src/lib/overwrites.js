import { permissions, calculatePermissions, parsePermissions } from "./permissions";

export const OVERWRITE_TYPES = [
  { value: 0, label: "Role" },
  { value: 1, label: "Member" },
];

/** Permission state for a single flag: "neutral" | "allow" | "deny" */
export function emptyOverwriteState() {
  return Object.fromEntries(Object.keys(permissions).map((key) => [key, "neutral"]));
}

export function stateFromBitfields(allow, deny) {
  const state = emptyOverwriteState();
  let allowKeys = [];
  let denyKeys = [];
  try {
    allowKeys = parsePermissions(allow || "0");
  } catch {
    /* ignore */
  }
  try {
    denyKeys = parsePermissions(deny || "0");
  } catch {
    /* ignore */
  }
  allowKeys.forEach((key) => {
    state[key] = "allow";
  });
  denyKeys.forEach((key) => {
    state[key] = "deny";
  });
  return state;
}

export function bitfieldsFromState(state) {
  const allowKeys = Object.entries(state)
    .filter(([, v]) => v === "allow")
    .map(([k]) => k);
  const denyKeys = Object.entries(state)
    .filter(([, v]) => v === "deny")
    .map(([k]) => k);
  return {
    allow: calculatePermissions(allowKeys).toString(),
    deny: calculatePermissions(denyKeys).toString(),
    allowKeys,
    denyKeys,
  };
}

export function buildOverwriteJson({ id, type, state }) {
  const { allow, deny } = bitfieldsFromState(state);
  return {
    id: id || "0",
    type: Number(type) || 0,
    allow,
    deny,
  };
}

/** Effective permission: deny wins over allow; unset inherits. */
export function resolveEffective(baseKeys, overwriteState) {
  const base = new Set(baseKeys);
  Object.entries(overwriteState).forEach(([key, mode]) => {
    if (mode === "allow") base.add(key);
    if (mode === "deny") base.delete(key);
  });
  return [...base];
}
