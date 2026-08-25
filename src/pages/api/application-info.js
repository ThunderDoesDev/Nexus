import { decodeSnowflake } from "../../lib/snowflake";
import { getBotToken } from "../../lib/botToken";

const USER_BADGES = [
  { bit: 16, name: "Verified Bot" },
  { bit: 19, name: "HTTP Interactions" },
];

function buildCdnUrl(path, hash, size = 128) {
  if (!hash) return null;
  const ext = hash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/${path}/${hash}.${ext}?size=${size}`;
}

function buildAppIconUrl(id, iconHash) {
  return buildCdnUrl(`app-icons/${id}`, iconHash);
}

function buildAvatarUrl(id, avatarHash) {
  if (!avatarHash) {
    const index = Number((BigInt(id) >> 22n) % 6n);
    return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
  }
  return buildCdnUrl(`avatars/${id}`, avatarHash);
}

function buildBannerUrl(id, bannerHash) {
  return buildCdnUrl(`banners/${id}`, bannerHash, 512);
}

function toHexColor(color) {
  if (color == null) return null;
  return `#${color.toString(16).padStart(6, "0")}`;
}

function getUserBadges(publicFlags = 0) {
  return USER_BADGES.filter(({ bit }) => (publicFlags & (1 << bit)) !== 0).map(({ name }) => name);
}

function pickCount(...values) {
  for (const value of values) {
    if (typeof value === "number" && value >= 0) return value;
  }
  return null;
}

async function fetchDirectoryApplication(applicationId) {
  const response = await fetch(
    `https://discord.com/api/v10/application-directory-static/applications/${applicationId}`,
    { headers: { Accept: "application/json" } }
  );
  if (!response.ok) return null;
  return response.json();
}

async function searchDirectoryByUser(user) {
  const response = await fetch(
    `https://discord.com/api/v10/application-directory-static/search?query=${encodeURIComponent(user.username)}&page_size=25`,
    { headers: { Accept: "application/json" } }
  );
  if (!response.ok) return null;
  const data = await response.json();
  const match = data.results?.find(
    (entry) => entry.data?.bot?.id === user.id || entry.data?.id === user.id
  );
  return match?.data ?? null;
}

async function fetchViaRpc(clientId) {
  const response = await fetch(`https://discord.com/api/v10/applications/${clientId}/rpc`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) return null;
  return response.json();
}

async function fetchDiscordResource(url, token) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bot ${token}`,
    },
  });
  if (!response.ok) return null;
  return response.json();
}

function formatApplicationInfo({ clientId, directory, user, app, publicApp, rpc }) {
  const appId = directory?.id ?? app?.id ?? publicApp?.id ?? rpc?.id ?? clientId;
  const bot = directory?.bot ?? user;
  const botUserId = bot?.id ?? user?.id ?? clientId;
  const snowflake = decodeSnowflake(appId);
  const publicFlags = bot?.public_flags ?? user?.public_flags ?? 0;

  const verified =
    directory?.is_verified === true ||
    Boolean(publicFlags & (1 << 16));

  const totalGuilds = pickCount(
    directory?.directory_entry?.guild_count,
    app?.approximate_guild_count,
    publicApp?.approximate_guild_count
  );

  const totalUsers = pickCount(
    app?.approximate_user_install_count,
    publicApp?.approximate_user_install_count
  );

  const totalAuthorizations = pickCount(
    app?.approximate_user_authorization_count,
    publicApp?.approximate_user_authorization_count
  );

  const description =
    directory?.description ||
    directory?.directory_entry?.short_description ||
    app?.description ||
    publicApp?.description ||
    rpc?.description ||
    "";

  const iconHash = directory?.icon ?? app?.icon ?? publicApp?.icon ?? rpc?.icon;
  const icon = iconHash
    ? buildAppIconUrl(appId, iconHash)
    : buildAvatarUrl(botUserId, bot?.avatar ?? user?.avatar);

  const tags = directory?.tags?.length
    ? directory.tags
    : app?.tags ?? publicApp?.tags ?? [];

  const categories = directory?.categories?.map((category) => category.name) ?? [];

  return {
    id: appId,
    botUserId: botUserId !== appId ? botUserId : null,
    name: directory?.name ?? app?.name ?? publicApp?.name ?? rpc?.name ?? user?.global_name ?? user?.username,
    username: bot?.username ?? user?.username ?? null,
    tag: bot?.username || user?.username ? `@${bot?.username ?? user?.username}` : null,
    description,
    icon,
    banner: bot?.banner ? buildBannerUrl(botUserId, bot.banner) : null,
    accentColor: toHexColor(bot?.accent_color ?? user?.accent_color),
    createdAt: snowflake?.createdAt.toISOString() ?? null,
    badges: getUserBadges(publicFlags),
    verified,
    discoverable: directory?.is_discoverable ?? null,
    monetized: directory?.is_monetized ?? null,
    botPublic: directory?.bot_public ?? app?.bot_public ?? publicApp?.bot_public ?? null,
    requireCodeGrant:
      directory?.bot_require_code_grant ??
      app?.bot_require_code_grant ??
      publicApp?.bot_require_code_grant ??
      null,
    termsOfServiceUrl:
      directory?.terms_of_service_url ??
      app?.terms_of_service_url ??
      publicApp?.terms_of_service_url ??
      null,
    privacyPolicyUrl:
      directory?.privacy_policy_url ??
      app?.privacy_policy_url ??
      publicApp?.privacy_policy_url ??
      null,
    tags,
    categories,
    totalGuilds,
    totalUsers,
    totalAuthorizations,
    supportServerMembers: directory?.guild?.approximate_member_count ?? null,
    supportServerName: directory?.guild?.name ?? null,
    inviteUrl: `https://discord.com/oauth2/authorize?client_id=${appId}&scope=bot`,
    developerPortalUrl: `https://discord.com/developers/applications/${appId}/information`,
    publicFlags,
  };
}

async function fetchViaBotToken(clientId, token) {
  let directory = await fetchDirectoryApplication(clientId);
  const rpc = await fetchViaRpc(clientId);

  const headers = {
    Accept: "application/json",
    Authorization: `Bot ${token}`,
  };

  let userResponse = await fetch(`https://discord.com/api/v10/users/${clientId}`, { headers });

  if (userResponse.status === 404 && !directory && !rpc) {
    return { error: "Application not found. Make sure the client ID is correct.", status: 404 };
  }

  let user = userResponse.ok ? await userResponse.json() : null;

  if (!directory && user?.bot) {
    directory = await searchDirectoryByUser(user);
  }

  const appId = directory?.id ?? clientId;
  const userId = directory?.bot?.id ?? clientId;

  if (!user && userId !== clientId) {
    userResponse = await fetch(`https://discord.com/api/v10/users/${userId}`, { headers });
    user = userResponse.ok ? await userResponse.json() : null;
  }

  if (!directory && !user && !rpc) {
    return { error: "Application not found. Make sure the client ID is correct.", status: 404 };
  }

  if (user && !user.bot) {
    return { error: "This ID does not belong to an application.", status: 400 };
  }

  const [app, publicApp] = await Promise.all([
    fetchDiscordResource(`https://discord.com/api/v10/applications/${appId}`, token),
    fetchDiscordResource(`https://discord.com/api/v10/applications/${appId}/public`, token),
  ]);

  return {
    data: formatApplicationInfo({ clientId, directory, user, app, publicApp, rpc }),
  };
}

async function fetchWithoutToken(clientId) {
  const directory = await fetchDirectoryApplication(clientId);
  const rpc = await fetchViaRpc(clientId);

  if (directory) {
    return { data: formatApplicationInfo({ clientId, directory, rpc }) };
  }

  if (rpc) {
    return { data: formatApplicationInfo({ clientId, rpc }) };
  }

  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { clientId } = req.body;
  if (!clientId) {
    return res.status(400).json({ error: "Client ID is required" });
  }
  if (!/^\d{17,19}$/.test(clientId)) {
    return res.status(400).json({ error: "Invalid client ID format" });
  }

  try {
    const token = getBotToken();

    if (token) {
      const applicationResult = await fetchViaBotToken(clientId, token);
      if (applicationResult.error) {
        return res.status(applicationResult.status).json({ error: applicationResult.error });
      }
      return res.status(200).json(applicationResult.data);
    }

    const publicResult = await fetchWithoutToken(clientId);
    if (publicResult) {
      return res.status(200).json(publicResult.data);
    }

    return res.status(503).json({
      error:
        "Could not fetch this application. Set token in settings/config.json for full lookups, or use a discoverable application's ID.",
    });
  } catch (error) {
    console.error("Error fetching application info:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
