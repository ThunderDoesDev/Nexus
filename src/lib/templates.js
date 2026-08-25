/** Guild template code parsing & formatting. */

export function parseTemplateCode(value) {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  const match = raw.match(
    /(?:discord(?:app)?\.com\/template\/|discord\.new\/)([a-zA-Z0-9-]+)/i
  );
  if (match?.[1]) return match[1];

  if (/^[a-zA-Z0-9-]{2,128}$/.test(raw)) return raw;
  return null;
}

export function templateUrl(code) {
  return code ? `https://discord.new/${code}` : "";
}

export function formatTemplate(data) {
  if (!data) return null;
  const source = data.serialized_source_guild;

  return {
    code: data.code,
    url: templateUrl(data.code),
    name: data.name,
    description: data.description,
    usageCount: data.usage_count ?? null,
    creatorId: data.creator_id ?? data.creator?.id ?? null,
    creator: data.creator
      ? {
          id: data.creator.id,
          username: data.creator.username,
          globalName: data.creator.global_name,
          avatar: data.creator.avatar && data.creator.id
            ? `https://cdn.discordapp.com/avatars/${data.creator.id}/${data.creator.avatar}.${
                data.creator.avatar.startsWith("a_") ? "gif" : "png"
              }?size=64`
            : null,
        }
      : null,
    createdAt: data.created_at ?? null,
    updatedAt: data.updated_at ?? null,
    isDirty: data.is_dirty ?? null,
    sourceGuildId: data.source_guild_id ?? source?.id ?? null,
    guild: source
      ? {
          id: source.id,
          name: source.name,
          description: source.description,
          iconHash: source.icon_hash,
          verificationLevel: source.verification_level,
          defaultMessageNotifications: source.default_message_notifications,
          explicitContentFilter: source.explicit_content_filter,
          preferredLocale: source.preferred_locale,
          afkTimeout: source.afk_timeout,
          systemChannelFlags: source.system_channel_flags,
          roles: Array.isArray(source.roles) ? source.roles.length : 0,
          channels: Array.isArray(source.channels) ? source.channels.length : 0,
          roleList: (source.roles || []).slice(0, 40).map((r) => ({
            id: r.id,
            name: r.name,
            color: r.color,
            permissions: r.permissions,
          })),
          channelList: (source.channels || []).slice(0, 60).map((c) => ({
            id: c.id,
            name: c.name,
            type: c.type,
            parentId: c.parent_id,
          })),
        }
      : null,
  };
}
