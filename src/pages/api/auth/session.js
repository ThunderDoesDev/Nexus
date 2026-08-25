import jwt from 'jsonwebtoken';
import config from '@/settings/config.json';

function parseCookies(req) {
  const cookies = {};
  const raw = req.headers.cookie || '';
  if (!raw) return cookies;
  raw.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.split('=');
    cookies[name.trim()] = decodeURIComponent(rest.join('='));
  });
  return cookies;
}
async function refreshDiscordToken(oldRefreshToken) {
  const res = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: oldRefreshToken
    })
  });
  if (!res.ok) throw new Error('Refresh failed');
  return res.json();
}

export default async function handler(req, res) {
    const cookies = parseCookies(req);
    const token = cookies['token'];
    if (!token) {
      return res.status(200).json({ session: null });
    }
    let sessionData;
    try {
      sessionData = jwt.verify(token, config.secret);
    } catch (error) {
      console.error('JWT Verification Error:', error);
      return res.status(401).json({ session: null });
    }
    const now = Math.floor(Date.now() / 1000);
    if (sessionData.tokenExpiry <= now + 60) {
      try {
        const refreshData = await refreshDiscordToken(sessionData.refreshToken);
        sessionData.accessToken  = refreshData.access_token;
        sessionData.refreshToken = refreshData.refresh_token;
        sessionData.tokenExpiry  = now + refreshData.expires_in;
        const newToken = jwt.sign(sessionData, config.secret, { expiresIn: '30d' });
        const isProd = config.isProduction;
        const cookieHeader = [
          `token=${newToken}`,
          'HttpOnly',
          'Path=/',
          `Max-Age=${30 * 24 * 60 * 60}`,
          isProd ? 'Secure' : '',
          isProd ? 'SameSite=None' : 'SameSite=Lax',
        ].filter(Boolean).join('; ');
        res.setHeader('Set-Cookie', cookieHeader);
      } catch {
        return res.status(401).json({ error: 'Token refresh failed', session: null });
      }
    }
    const user = {
      id:                sessionData.id,
      name:              sessionData.username,
      image:             sessionData.avatar
        ? `https://cdn.discordapp.com/avatars/${sessionData.id}/${sessionData.avatar}?size=128`
        : 'https://cdn.discordapp.com/embed/avatars/0.png',
      banner:            sessionData.banner
        ? `https://cdn.discordapp.com/banners/${sessionData.id}/${sessionData.banner}?size=128`
        : null
    };
    const expiresIn = sessionData.tokenExpiry - now;
    return res.status(200).json({
      session: {
        guilds:       sessionData.guilds,
        user,
        accessToken:  sessionData.accessToken,
        refreshToken: sessionData.refreshToken,
        expiresIn,
        createdAt:    sessionData.createdAt,
        status:       'login',
      }
    });
}

