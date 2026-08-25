import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import config from '@/settings/config.json';
import { fetchManageableGuilds } from '@/lib/guildCache';

export default async function handler(req, res) {
  const { code, state } = req.query;
  if (!code || !state) {
    return res.status(400).json({ error: 'Missing code or state' });
  }
  try {
    jwt.verify(state, config.secret);
  } catch {
    return res.status(400).json({ error: 'Authorization state expired or invalid' });
  }
  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     config.clientId,
      client_secret: config.clientSecret,
      grant_type:    'authorization_code',
      code,
      redirect_uri:  config.callbackUrl,
      scope:         config.mainScopes
    })
  });
  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) {
    return res.status(400).json({ error: 'Token exchange failed', details: tokenData });
  }
  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });
  const user = await userRes.json();
  if (!userRes.ok) {
    return res.status(400).json({ error: 'User info fetch failed', details: user });
  }
  const tokenExpiry = Math.floor(Date.now() / 1000) + tokenData.expires_in;
  const payload = {
    id:           user.id,
    username:     user.username,
    avatar:       user.avatar || null,
    accessToken:  tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    tokenExpiry
  };
  // Warm guild cache so /dashboard does not immediately hit Discord again
  try {
    await fetchManageableGuilds(user.id, tokenData.access_token, { force: true });
  } catch {
    // Non-fatal — dashboard can fetch later
  }
  const sessionToken = jwt.sign(payload, config.secret, { expiresIn: '30d' });
  const isProd = config.isProduction;
  const cookie = [
    `token=${sessionToken}`,
    'HttpOnly',
    'Path=/',
    `Max-Age=${30 * 24 * 60 * 60}`,
    isProd ? 'Secure' : '',
    isProd ? 'SameSite=None' : 'SameSite=Lax'
  ].filter(Boolean).join('; ');
  res.setHeader('Set-Cookie', cookie);
  res.redirect('/');
}
