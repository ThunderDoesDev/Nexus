import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import config from '@/settings/config.json';

async function parseCookies(req) {
  const cookies = {};
  const raw = req.headers.cookie || '';
  if (!raw) return cookies;
  raw.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.split('=');
    cookies[name.trim()] = decodeURIComponent(rest.join('='));
  });
  return cookies;
}

export default async function handler(req, res) {
  const { redirect, reason } = req.query;
  const cookies = parseCookies(req);
  const oldToken = cookies['token'];
  if (!oldToken) {
    const loginRedirectUrl = `/api/auth/login?${redirect ? `redirect=${encodeURIComponent(redirect)}&` : ''}reason=${reason || 'no_refresh_token'}`;
    return res.redirect(302, loginRedirectUrl).end();
  }
  let decodedOldToken;
  try {
    decodedOldToken = jwt.verify(oldToken, config.secret, { ignoreExpiration: true });
  } catch (error) {
    console.error('Error verifying old token during refresh:', error);
    const loginRedirectUrl = `/api/auth/login?${redirect ? `redirect=${encodeURIComponent(redirect)}&` : ''}reason=invalid_token_format_refresh`;
    return res.redirect(302, loginRedirectUrl).end();
  }
  const { refreshToken: userRefreshToken, id: userId, username, avatar } = decodedOldToken;
  if (!userRefreshToken) {
    console.warn('Refresh token missing from decoded old token for user:', userId);
    const loginRedirectUrl = `/api/auth/login?${redirect ? `redirect=${encodeURIComponent(redirect)}&` : ''}reason=missing_refresh_payload`;
    return res.redirect(302, loginRedirectUrl).end();
  }
  try {
    const response = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: userRefreshToken,
      }),
    });
    const tokens = await response.json();
    if (!response.ok || tokens.error) {
      console.error('Discord token refresh failed:', tokens.error || response.statusText);
      res.setHeader('Set-Cookie', serialize('aurelios-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        expires: new Date(0),
        path: '/',
        sameSite: 'lax',
      }));
      const loginRedirectUrl = `/api/auth/login?${redirect ? `redirect=${encodeURIComponent(redirect)}&` : ''}reason=discord_refresh_failed`;
      return res.redirect(302, loginRedirectUrl).end();
    }
    const { access_token: newAccessToken, refresh_token: newRefreshToken, expires_in: expiresIn } = tokens;
    const newJwtPayload = {
      id: userId,
      username: username,
      avatar: avatar,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      ...decodedOldToken
    };
    delete newJwtPayload.iat;
    delete newJwtPayload.exp;
    newJwtPayload.accessToken = newAccessToken;
    newJwtPayload.refreshToken = newRefreshToken;
    const newSignedToken = jwt.sign(newJwtPayload, config.secret, { expiresIn: expiresIn || '1h' });
    res.setHeader('Set-Cookie', serialize('token', newSignedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      maxAge: expiresIn || 3600,
      path: '/',
      sameSite: 'lax',
    }));
    return res.redirect(302, redirect || '/').end();
  } catch (error) {
    console.error('Error during token refresh process:', error);
    const loginRedirectUrl = `/api/auth/login?${redirect ? `redirect=${encodeURIComponent(redirect)}&` : ''}reason=refresh_internal_error`;
    return res.redirect(302, loginRedirectUrl).end();
  }
} 