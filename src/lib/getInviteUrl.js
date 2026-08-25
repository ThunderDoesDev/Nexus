export function getInviteUrl({ clientId, scopes, permissionValue, permissions, redirectUri, requireCodeGrant, guildId, disableGuildSelect }) {
  const perms = permissionValue ?? permissions;
  if (!clientId || !clientId.trim()) return '';
  const params = new URLSearchParams();
  params.append('client_id', clientId.trim());
  if (scopes && scopes.length > 0) {
    params.append('scope', scopes.join(' '));
  }
  if (perms && perms !== '0') {
    params.append('permissions', perms);
  }
  if (redirectUri && redirectUri.trim()) {
    params.append('redirect_uri', redirectUri.trim());
  }
  if (requireCodeGrant) {
    params.append('response_type', 'code');
  }
  if (guildId) {
    params.append('guild_id', String(guildId));
  }
  if (disableGuildSelect) {
    params.append('disable_guild_select', 'true');
  }
  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}

/** Bot invite deep-link for a specific guild (opens Discord authorize / app). */
export function getBotGuildInviteUrl(clientId, guildId, permissions = '0') {
  return getInviteUrl({
    clientId,
    scopes: ['bot', 'applications.commands'],
    permissions,
    guildId,
    disableGuildSelect: true,
  });
}

