/** Extract an invite code from a URL or raw code. */
export function parseInviteCode(value) {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  const match = raw.match(
    /(?:discord(?:app)?\.com\/invite\/|discord\.gg\/)([a-zA-Z0-9-]+)/i
  );
  if (match?.[1]) return match[1];

  if (/^[a-zA-Z0-9-]{2,32}$/.test(raw)) return raw;
  return null;
}

export function inviteUrl(code) {
  return code ? `https://discord.gg/${code}` : "";
}

export function formatInvite(data) {
  if (!data) return null;
  const guild = data.guild;
  const channel = data.channel;
  const inviter = data.inviter;

  return {
    code: data.code,
    url: inviteUrl(data.code),
    type: data.type,
    temporary: data.temporary ?? null,
    maxUses: data.max_uses ?? null,
    uses: data.uses ?? null,
    maxAge: data.max_age ?? null,
    createdAt: data.created_at ?? null,
    expiresAt: data.expires_at ?? null,
    approximateMemberCount: data.approximate_member_count ?? null,
    approximatePresenceCount: data.approximate_presence_count ?? null,
    guild: guild
      ? {
          id: guild.id,
          name: guild.name,
          description: guild.description,
          icon: guild.icon
            ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${
                guild.icon.startsWith("a_") ? "gif" : "png"
              }?size=128`
            : null,
          splash: guild.splash
            ? `https://cdn.discordapp.com/splashes/${guild.id}/${guild.splash}.png?size=512`
            : null,
          banner: guild.banner
            ? `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.${
                guild.banner.startsWith("a_") ? "gif" : "png"
              }?size=512`
            : null,
          features: guild.features || [],
          verificationLevel: guild.verification_level,
          nsfwLevel: guild.nsfw_level,
          premiumSubscriptionCount: guild.premium_subscription_count ?? null,
          vanityUrlCode: guild.vanity_url_code ?? null,
        }
      : null,
    channel: channel
      ? {
          id: channel.id,
          name: channel.name,
          type: channel.type,
        }
      : null,
    inviter: inviter
      ? {
          id: inviter.id,
          username: inviter.username,
          globalName: inviter.global_name,
          avatar: inviter.avatar && inviter.id
            ? `https://cdn.discordapp.com/avatars/${inviter.id}/${inviter.avatar}.${
                inviter.avatar.startsWith("a_") ? "gif" : "png"
              }?size=64`
            : inviter.id
              ? `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(inviter.id) >> 22n) % 6}.png`
              : "https://cdn.discordapp.com/embed/avatars/0.png",
          bot: inviter.bot ?? false,
        }
      : null,
    targetType: data.target_type ?? null,
    targetUser: data.target_user
      ? {
          id: data.target_user.id,
          username: data.target_user.username,
        }
      : null,
    targetApplication: data.target_application
      ? {
          id: data.target_application.id,
          name: data.target_application.name,
          description: data.target_application.description,
          icon: data.target_application.icon
            ? `https://cdn.discordapp.com/app-icons/${data.target_application.id}/${data.target_application.icon}.png?size=64`
            : null,
        }
      : null,
  };
}
