import { parseWebhookUrl, toWebhookApiUrl } from "../../lib/webhook";

async function discordJson(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function hasComponents(payload) {
  return Array.isArray(payload?.components) && payload.components.length > 0;
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { webhookUrl, messageId } = req.query;
    const parsed = parseWebhookUrl(webhookUrl);
    if (!parsed || !messageId) {
      return res.status(400).json({ error: "Webhook URL and message ID are required." });
    }

    try {
      const url = toWebhookApiUrl(parsed.baseUrl, { messageId });
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
      });
      const data = await discordJson(response);
      if (!response.ok) {
        return res.status(response.status).json({ error: data.message || "Failed to fetch message." });
      }
      return res.status(200).json(data);
    } catch {
      return res.status(500).json({ error: "Failed to reach Discord." });
    }
  }

  if (req.method === "POST") {
    const { webhookUrl, payload } = req.body ?? {};
    const parsed = parseWebhookUrl(webhookUrl);
    if (!parsed) {
      return res.status(400).json({ error: "Invalid webhook URL." });
    }
    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ error: "Payload is required." });
    }

    try {
      const url = toWebhookApiUrl(parsed.baseUrl, {
        wait: true,
        withComponents: hasComponents(payload),
      });
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await discordJson(response);
      if (!response.ok) {
        return res.status(response.status).json({
          error: data.message || "Failed to send message.",
          code: data.code,
        });
      }
      return res.status(200).json(data);
    } catch {
      return res.status(500).json({ error: "Failed to reach Discord." });
    }
  }

  if (req.method === "PATCH") {
    const { webhookUrl, messageId, payload } = req.body ?? {};
    const parsed = parseWebhookUrl(webhookUrl);
    if (!parsed) {
      return res.status(400).json({ error: "Invalid webhook URL." });
    }
    if (!messageId) {
      return res.status(400).json({ error: "Message ID is required." });
    }
    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ error: "Payload is required." });
    }

    try {
      const url = toWebhookApiUrl(parsed.baseUrl, {
        messageId,
        withComponents: hasComponents(payload),
      });
      const response = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await discordJson(response);
      if (!response.ok) {
        return res.status(response.status).json({
          error: data.message || "Failed to update message.",
          code: data.code,
        });
      }
      return res.status(200).json(data);
    } catch {
      return res.status(500).json({ error: "Failed to reach Discord." });
    }
  }

  if (req.method === "DELETE") {
    const { webhookUrl, messageId } = req.body ?? {};
    const parsed = parseWebhookUrl(webhookUrl);
    if (!parsed) {
      return res.status(400).json({ error: "Invalid webhook URL." });
    }
    if (!messageId) {
      return res.status(400).json({ error: "Message ID is required." });
    }

    try {
      const url = toWebhookApiUrl(parsed.baseUrl, { messageId });
      const response = await fetch(url, { method: "DELETE" });
      if (!response.ok) {
        const data = await discordJson(response);
        return res.status(response.status).json({ error: data.message || "Failed to delete message." });
      }
      return res.status(200).json({ ok: true });
    } catch {
      return res.status(500).json({ error: "Failed to reach Discord." });
    }
  }

  return res.status(405).json({ error: "Method not allowed." });
}
