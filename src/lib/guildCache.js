import config from "@/settings/config.json";
import { canManageGuild, guildIconUrl } from "@/lib/auth";
import { getBotGuildInviteUrl } from "@/lib/getInviteUrl";

const TTL_MS = 5 * 60 * 1000;
const cache = new Map();
const inflight = new Map();

let botGuildCache = null; // { guilds: Array, ids: Set<string>, fetchedAt }
let botGuildInflight = null;

function normalizeBotGuild(g) {
  return {
    id: String(g.id),
    name: g.name || "Unknown Server",
    icon: guildIconUrl(g),
    owner: Boolean(g.owner),
    approximateMemberCount: g.approximate_member_count ?? null,
  };
}

function withBotStatus(guilds, botGuildIds) {
  return (guilds || []).map((g) => {
    const botInGuild = botGuildIds.has(String(g.id));
    return {
      ...g,
      botInGuild,
      inviteUrl: botInGuild ? null : getBotGuildInviteUrl(config.clientId, g.id),
    };
  });
}

function normalizeGuilds(data, botGuildIds) {
  return withBotStatus(
    (Array.isArray(data) ? data : [])
      .filter(canManageGuild)
      .map((g) => ({
        id: g.id,
        name: g.name,
        icon: guildIconUrl(g),
        owner: Boolean(g.owner),
        permissions: String(g.permissions ?? "0"),
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    botGuildIds
  );
}

export function getCachedGuilds(userId) {
  const entry = cache.get(userId);
  if (!entry) return null;
  return {
    guilds: entry.guilds,
    fresh: Date.now() - entry.fetchedAt < TTL_MS,
    fetchedAt: entry.fetchedAt,
  };
}

export function setCachedGuilds(userId, guilds) {
  cache.set(userId, { guilds, fetchedAt: Date.now() });
}

async function loadBotGuildCache({ force = false } = {}) {
  const token = config.token;
  if (!token) {
    return { guilds: [], ids: new Set(), fetchedAt: Date.now(), cached: false };
  }

  if (!force && botGuildCache && Date.now() - botGuildCache.fetchedAt < TTL_MS) {
    return { ...botGuildCache, cached: true };
  }
  if (!force && botGuildInflight) return botGuildInflight;

  botGuildInflight = (async () => {
    const guilds = [];
    let after = undefined;

    // Paginate — Discord returns up to 200 guilds per request
    for (let page = 0; page < 25; page++) {
      const url = new URL("https://discord.com/api/v10/users/@me/guilds");
      url.searchParams.set("limit", "200");
      url.searchParams.set("with_counts", "true");
      if (after) url.searchParams.set("after", after);

      const res = await fetch(url, {
        headers: { Authorization: `Bot ${token}` },
      });

      if (res.status === 429) {
        if (botGuildCache) return { ...botGuildCache, cached: true };
        const body = await res.json().catch(() => ({}));
        const err = new Error("Discord rate limit exceeded (bot guilds)");
        err.status = 429;
        err.retryAfter = Number(body?.retry_after ?? res.headers.get("retry-after") ?? 5);
        throw err;
      }

      const data = await res.json();
      if (!res.ok) {
        if (botGuildCache) return { ...botGuildCache, cached: true };
        const err = new Error(data?.message || "Failed to fetch bot guilds");
        err.status = res.status;
        throw err;
      }

      if (!Array.isArray(data) || data.length === 0) break;
      for (const g of data) guilds.push(normalizeBotGuild(g));
      if (data.length < 200) break;
      after = data[data.length - 1].id;
    }

    guilds.sort((a, b) => a.name.localeCompare(b.name));
    const ids = new Set(guilds.map((g) => g.id));
    botGuildCache = { guilds, ids, fetchedAt: Date.now() };
    return { ...botGuildCache, cached: false };
  })().finally(() => {
    botGuildInflight = null;
  });

  return botGuildInflight;
}

async function fetchBotGuildIds({ force = false } = {}) {
  const cache = await loadBotGuildCache({ force });
  return cache.ids instanceof Set ? cache.ids : new Set();
}

/** Full list of guilds the configured bot is a member of. */
export async function fetchBotGuilds({ force = false } = {}) {
  const cache = await loadBotGuildCache({ force });
  return {
    guilds: cache.guilds || [],
    cached: Boolean(cache.cached),
  };
}

/** True if the configured bot is a member of the guild. */
export async function isBotInGuild(guildId, { force = false } = {}) {
  if (!guildId) return false;
  const ids = await fetchBotGuildIds({ force });
  if (ids.has(String(guildId))) return true;

  // Fallback probe — covers bots that can't list all guilds
  const token = config.token;
  if (!token) return false;
  try {
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
      headers: { Authorization: `Bot ${token}` },
    });
    if (res.ok) {
      ids.add(String(guildId));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function botInviteUrlForGuild(guildId) {
  return getBotGuildInviteUrl(config.clientId, guildId);
}

export async function fetchManageableGuilds(userId, accessToken, { force = false } = {}) {
  if (!userId || !accessToken) {
    return { guilds: [], cached: false };
  }

  const cached = getCachedGuilds(userId);
  if (!force && cached?.fresh) {
    const botGuildIds = await fetchBotGuildIds({ force: false }).catch(
      () => botGuildCache?.ids || new Set()
    );
    const guilds = withBotStatus(
      cached.guilds,
      botGuildIds instanceof Set ? botGuildIds : new Set()
    );
    setCachedGuilds(userId, guilds);
    return { guilds, cached: true };
  }

  if (!force && inflight.has(userId)) {
    return inflight.get(userId);
  }

  const request = (async () => {
    const [guildRes, botGuildIds] = await Promise.all([
      fetch("https://discord.com/api/v10/users/@me/guilds", {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      fetchBotGuildIds({ force }).catch(() => botGuildCache?.ids || new Set()),
    ]);

    if (guildRes.status === 429) {
      const retryAfterHeader = guildRes.headers.get("retry-after");
      let body = null;
      try {
        body = await guildRes.json();
      } catch {
        body = null;
      }
      const retryAfter = Number(body?.retry_after ?? retryAfterHeader ?? 5);
      if (cached?.guilds) {
        return {
          guilds: cached.guilds,
          cached: true,
          stale: true,
          retryAfter,
        };
      }
      const err = new Error("Discord rate limit exceeded");
      err.status = 429;
      err.retryAfter = retryAfter;
      throw err;
    }

    const data = await guildRes.json();
    if (!guildRes.ok) {
      if (cached?.guilds) {
        return { guilds: cached.guilds, cached: true, stale: true };
      }
      const err = new Error(data?.message || "Failed to fetch guilds");
      err.status = guildRes.status;
      err.details = data;
      throw err;
    }

    const guilds = normalizeGuilds(data, botGuildIds instanceof Set ? botGuildIds : new Set());
    setCachedGuilds(userId, guilds);
    return { guilds, cached: false };
  })().finally(() => {
    inflight.delete(userId);
  });

  inflight.set(userId, request);
  return request;
}
