# Nexus

All-in-one Discord developer toolkit. Build permission bitfields, OAuth invites, embeds, slash commands, and more — then copy values you can paste into Discord.

Live site: [nexus.thunderdoesdev.gg](https://nexus.thunderdoesdev.gg)

## Features

Most tools work in the browser with no login. Lookups, login, and the companion bot need a Discord application configured in `settings/config.json`.

**Access** — permission calculator and decoder, channel overwrites, effective perms, OAuth invite URLs, gateway intents

**Identity** — application / user / guild lookup, username history, invite and template lookup, vanity and username checkers, snowflakes, flags, guild features, rich presence

**Creator** — Unicode fonts, spoilers, status ideas, fake messages, profile rings, fake pings, ANSI color text

**Messages** — embed, component, interaction, poll, and slash-command builders, localizations, markdown preview, webhooks, mentions, timestamps

**Guild** — AutoMod rules and regex, scheduled events, server ad checklist

**Utilities** — Discord limit checker, discord.js / discord.py export, API cookbook, message links, CDN URLs, widgets, color converter

The site also includes Discord OAuth login, a guild dashboard, and a discord.js bot with matching slash commands (`/permissions`, `/snowflake`, `/user`, `/embed`, and others).

## Prerequisites

- [Node.js](https://nodejs.org/) 20 or newer
- npm
- A [Discord application](https://discord.com/developers/applications) (bot token + OAuth2) if you want login, lookups, or the bot
- MySQL if you enable the database (optional)

## Setup

```bash
git clone https://github.com/ThunderDoesDev/Nexus.git
cd Nexus
npm install
```

Copy the example config and fill in your own values. **Do not commit the real file.**

```bash
cp settings/config.example.json settings/config.json
```

On Windows PowerShell:

```powershell
Copy-Item settings/config.example.json settings/config.json
```

### Config

| Field | Purpose |
| --- | --- |
| `token` | Bot token from the Discord Developer Portal |
| `clientId` | Application ID |
| `clientSecret` | OAuth2 client secret |
| `callbackUrl` | Must match a redirect URL in the portal (local default: `http://localhost:2028/api/auth/callback`) |
| `mainScopes` | OAuth scopes requested at login |
| `secret` | Long random string used to sign sessions — never reuse the example value |
| `isProduction` | Set `true` in production |
| `bot` | Display name, developer user IDs, support invite, embed color, maintenance mode |
| `channels` | Optional Discord channel IDs for error / command / journal logs |
| `database` | MySQL connection. Set `enabled` to `false` to skip it |

`settings/config.json` and `.env` files are gitignored. Share `settings/config.example.json` only.

In the Discord Developer Portal, add the same callback URL under **OAuth2 → Redirects**, and enable the bot intents you need.

For production, set `NEXT_PUBLIC_SITE_URL` to your public origin (for example `https://nexus.thunderdoesdev.gg`).

## Running locally

Website (port 2028):

```bash
npm run dev
```

Open [http://localhost:2028](http://localhost:2028).

Bot (second terminal):

```bash
npm run bot:shard
```

Use `npm run bot` to run a single unsharded process instead.

Production:

```bash
npm run build
npm start
```

Other scripts:

| Script | What it does |
| --- | --- |
| `npm run presence` | Refresh rich-presence cache (`scripts/presence.mjs`) |

## Project structure

```
Nexus/
├── bot/                    # discord.js bot (commands, events, sharding)
├── scripts/                # maintenance scripts
├── settings/
│   ├── config.example.json # safe template — commit this
│   └── config.json         # local secrets — never commit
├── src/
│   ├── components/         # UI, tools, dashboard
│   ├── context/            # auth, theme, site URL
│   ├── lib/                # Discord helpers and API clients
│   ├── pages/              # Next.js routes and API endpoints
│   └── styles/
├── public/
├── package.json
└── next.config.mjs
```

Tools live under `src/components/tools/`. Bot slash commands live under `bot/Commands/`.

## Support

Open an issue on this repository or join the Discord:

[Join Support Server](https://discord.gg/thunderdoesdev)

## License

MIT — see [LICENSE](LICENSE).
