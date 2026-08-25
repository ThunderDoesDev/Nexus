import { permissions, calculatePermissions, parsePermissions } from "./permissions";

/**
 * Discord channel permission resolution:
 * 1. Start with @everyone role perms
 * 2. OR all member role perms
 * 3. Administrator ⇒ all channel perms
 * 4. Apply @everyone overwrite (deny, then allow)
 * 5. Aggregate role overwrites (OR denies, OR allows), apply deny then allow
 * 6. Apply member overwrite (deny, then allow)
 */

function toBigInt(value) {
  try {
    return BigInt(value || "0");
  } catch {
    return 0n;
  }
}

function applyOverwrite(base, allow, deny) {
  let result = base;
  result &= ~toBigInt(deny);
  result |= toBigInt(allow);
  return result;
}

export function parsePermInput(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return 0n;
  try {
    return BigInt(trimmed);
  } catch {
    return 0n;
  }
}

export function emptyLayer(kind = "role") {
  return {
    id: `${kind}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    label: kind === "everyone" ? "@everyone" : kind === "member" ? "Member" : "Role",
    kind,
    permissions: "0",
    allow: "0",
    deny: "0",
    enabled: true,
  };
}

export function createDefaultEffectiveState() {
  return {
    everyone: {
      ...emptyLayer("everyone"),
      permissions: "2048", // VIEW_CHANNEL default-ish starter; user can change
      label: "@everyone",
    },
    roles: [
      {
        ...emptyLayer("role"),
        label: "Role A",
        permissions: "3072", // VIEW + SEND example
      },
    ],
    everyoneOverwrite: {
      allow: "0",
      deny: "0",
      enabled: false,
    },
    roleOverwrites: [
      {
        id: `ow_${Date.now()}`,
        label: "Role overwrite",
        allow: "0",
        deny: "0",
        enabled: false,
      },
    ],
    memberOverwrite: {
      allow: "0",
      deny: "0",
      enabled: false,
    },
  };
}

export function computeEffective(state) {
  const steps = [];

  let base = parsePermInput(state.everyone?.permissions);
  steps.push({
    id: "everyone",
    label: "@everyone base",
    value: base.toString(),
    detail: "Start with @everyone role permissions",
  });

  for (const role of state.roles || []) {
    if (!role.enabled) continue;
    const perms = parsePermInput(role.permissions);
    base |= perms;
    steps.push({
      id: role.id,
      label: `${role.label || "Role"} OR`,
      value: base.toString(),
      detail: `OR role permissions (${perms.toString()})`,
    });
  }

  const admin = permissions.ADMINISTRATOR.value;
  const hasAdmin = (base & admin) === admin;
  if (hasAdmin) {
    const all = calculatePermissions(Object.keys(permissions));
    steps.push({
      id: "admin",
      label: "Administrator",
      value: all.toString(),
      detail: "ADMINISTRATOR grants all channel permissions",
    });
    return {
      value: all.toString(),
      keys: Object.keys(permissions),
      hasAdmin: true,
      steps,
    };
  }

  if (state.everyoneOverwrite?.enabled) {
    base = applyOverwrite(base, state.everyoneOverwrite.allow, state.everyoneOverwrite.deny);
    steps.push({
      id: "everyone_ow",
      label: "@everyone overwrite",
      value: base.toString(),
      detail: `deny ${state.everyoneOverwrite.deny || "0"} → allow ${state.everyoneOverwrite.allow || "0"}`,
    });
  }

  const activeRoleOws = (state.roleOverwrites || []).filter((ow) => ow.enabled);
  if (activeRoleOws.length) {
    let deny = 0n;
    let allow = 0n;
    for (const ow of activeRoleOws) {
      deny |= parsePermInput(ow.deny);
      allow |= parsePermInput(ow.allow);
    }
    base = applyOverwrite(base, allow.toString(), deny.toString());
    steps.push({
      id: "roles_ow",
      label: "Role overwrites",
      value: base.toString(),
      detail: `aggregate deny ${deny.toString()} → allow ${allow.toString()}`,
    });
  }

  if (state.memberOverwrite?.enabled) {
    base = applyOverwrite(base, state.memberOverwrite.allow, state.memberOverwrite.deny);
    steps.push({
      id: "member_ow",
      label: "Member overwrite",
      value: base.toString(),
      detail: `deny ${state.memberOverwrite.deny || "0"} → allow ${state.memberOverwrite.allow || "0"}`,
    });
  }

  let keys = [];
  try {
    keys = parsePermissions(base.toString());
  } catch {
    keys = [];
  }

  return {
    value: base.toString(),
    keys,
    hasAdmin: false,
    steps,
  };
}
