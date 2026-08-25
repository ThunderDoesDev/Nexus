import config from '@/settings/config.json';

export default function handler(req, res) {
  const isProd = config.isProduction;
  const cookie = [
    'token=',
    'HttpOnly',
    'Path=/',
    'Max-Age=0',
    isProd ? 'Secure' : '',
    isProd ? 'SameSite=None' : 'SameSite=Lax',
  ].filter(Boolean).join('; ');
  res.setHeader('Set-Cookie', cookie);
  res.redirect('/');
}
