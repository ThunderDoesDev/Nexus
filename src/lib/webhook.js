export const WEBHOOK_URL_RE =
  /^https:\/\/(discord\.com|discordapp\.com)\/api\/webhooks\/(\d+)\/([\w-]+)/;

export function parseWebhookUrl(url) {
  const clean = url?.trim().split("?")[0];
  const match = WEBHOOK_URL_RE.exec(clean);
  if (!match) return null;
  return { baseUrl: match[0], id: match[1], token: match[2] };
}

export function isValidWebhookUrl(url) {
  return WEBHOOK_URL_RE.test(url?.trim().split("?")[0]);
}

export function toWebhookApiUrl(baseUrl, { messageId, wait, withComponents } = {}) {
  const normalized = baseUrl.replace(
    /^https:\/\/(?:discord\.com|discordapp\.com)\/api\/webhooks\//,
    "https://discord.com/api/v10/webhooks/"
  );

  let url = normalized;
  if (messageId) url += `/messages/${messageId}`;

  const params = new URLSearchParams();
  if (wait) params.set("wait", "true");
  if (withComponents) params.set("with_components", "true");

  const query = params.toString();
  return query ? `${url}?${query}` : url;
}
