import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '@/settings/config.json';

export default function handler(req, res) {
  const state = jwt.sign(
    { nonce: crypto.randomBytes(16).toString('hex') },
    config.secret,
    { expiresIn: '5m' }
  );
  const scopes = config.mainScopes;
  const callbackUrl = encodeURIComponent(config.callbackUrl);
  const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${config.clientId}&redirect_uri=${callbackUrl}&response_type=code&scope=${encodeURIComponent(
    scopes
  )}&state=${state}`;
  res.redirect(authUrl);
}
