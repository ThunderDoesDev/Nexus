import jwt from "jsonwebtoken";
import config from "@/settings/config.json";

export function parseCookies(req) {
  const cookies = {};
  const raw = req.headers.cookie || "";
  if (!raw) return cookies;
  raw.split(";").forEach((cookie) => {
    const [name, ...rest] = cookie.split("=");
    cookies[name.trim()] = decodeURIComponent(rest.join("="));
  });
  return cookies;
}

export function getSessionFromReq(req) {
  const token = parseCookies(req).token;
  if (!token) return null;
  try {
    return jwt.verify(token, config.secret);
  } catch {
    return null;
  }
}

export function guildIconUrl(guild, size = 128) {
  if (!guild?.id) return null;
  if (guild.icon) {
    const ext = guild.icon.startsWith("a_") ? "gif" : "png";
    return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${ext}?size=${size}`;
  }
  return null;
}

/** True if user owns the guild or has Administrator / Manage Server. */
export function canManageGuild(guild) {
  if (!guild) return false;
  if (guild.owner) return true;
  try {
    const perms = BigInt(guild.permissions ?? 0);
    const ADMINISTRATOR = 1n << 3n;
    const MANAGE_GUILD = 1n << 5n;
    return (perms & ADMINISTRATOR) === ADMINISTRATOR || (perms & MANAGE_GUILD) === MANAGE_GUILD;
  } catch {
    return false;
  }
}
