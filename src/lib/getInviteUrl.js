export function getInviteUrl({ clientId, scopes, permissionValue, redirectUri, requireCodeGrant }) {
  if (!clientId || !clientId.trim()) return '';
  const params = new URLSearchParams();
  params.append('client_id', clientId.trim());
  if (scopes && scopes.length > 0) {
    params.append('scope', scopes.join(' '));
  }
  if (permissionValue && permissionValue !== '0') {
    params.append('permissions', permissionValue);
  }
  if (redirectUri && redirectUri.trim()) {
    params.append('redirect_uri', redirectUri.trim());
  }
  if (requireCodeGrant) {
    params.append('response_type', 'code');
  }
  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}
