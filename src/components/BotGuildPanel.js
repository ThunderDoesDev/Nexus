import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import Dropdown from "./ui/Dropdown";
import { ToolSection, FieldLabel } from "./ToolPanel";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

/**
 * Guild picker for bot-in-server tools (slash commands, AutoMod, events).
 * Optionally loads channels with a types filter.
 */
export default function BotGuildPanel({
  title = "Deploy with bot",
  description,
  children,
  showChannels = false,
  channelTypes,
  guildId,
  onGuildIdChange,
  channelId,
  onChannelIdChange,
  channelLabel = "Channel",
  requireBot = true,
  bare = false,
}) {
  const { user, loading: authLoading, login, guilds, guildsLoading, loadGuilds } = useAuth();
  const [channels, setChannels] = useState([]);
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [channelsError, setChannelsError] = useState(null);

  const selectedGuild = (guilds || []).find((g) => String(g.id) === String(guildId));
  const botGuilds = useMemo(() => (guilds || []).filter((g) => g.botInGuild), [guilds]);
  const guildsWithoutBot = useMemo(() => (guilds || []).filter((g) => !g.botInGuild), [guilds]);

  const guildOptions = useMemo(() => {
    const withBot = botGuilds.map((g) => ({ value: g.id, label: g.name }));
    const without = guildsWithoutBot.map((g) => ({
      value: g.id,
      label: `${g.name} (bot not in server)`,
    }));
    return [...withBot, ...without];
  }, [botGuilds, guildsWithoutBot]);

  const channelOptions = useMemo(
    () =>
      channels.map((ch) => ({
        value: ch.id,
        label: ch.parentName ? `#${ch.name} · ${ch.parentName}` : `#${ch.name}`,
      })),
    [channels]
  );

  useEffect(() => {
    if (!user) return;
    loadGuilds().catch(() => {});
  }, [user, loadGuilds]);

  useEffect(() => {
    if (!showChannels || !guildId || !selectedGuild?.botInGuild) {
      setChannels([]);
      setChannelsError(null);
      return;
    }

    let cancelled = false;
    setChannelsLoading(true);
    setChannelsError(null);
    if (onChannelIdChange) onChannelIdChange("");

    const params = new URLSearchParams({ guildId });
    if (channelTypes?.length) params.set("types", channelTypes.join(","));

    fetch(`/api/guild-channels?${params}`, { credentials: "include" })
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setChannels([]);
          setChannelsError(data.error || "Failed to load channels.");
          return;
        }
        setChannels(data.channels || []);
      })
      .catch(() => {
        if (!cancelled) {
          setChannels([]);
          setChannelsError("Failed to load channels.");
        }
      })
      .finally(() => {
        if (!cancelled) setChannelsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [showChannels, guildId, selectedGuild?.botInGuild, channelTypes?.join?.(",")]);

  const channelReady = !showChannels || Boolean(channelId);

  const body = (
      <div className="space-y-3">
        {authLoading ? (
          <p className="text-sm text-[var(--nx-text-muted)]">Checking session…</p>
        ) : !user ? (
          <div className="rounded-lg border border-[var(--nx-border)] bg-[#1e1f22] p-3 space-y-2">
            <p className="text-sm text-[var(--nx-text-muted)]">
              Log in with Discord to use the bot in servers you manage.
            </p>
            <Button type="button" size="sm" onClick={login}>
              Log in with Discord
            </Button>
          </div>
        ) : (
          <>
            <div>
              <FieldLabel>Server</FieldLabel>
              <Dropdown
                value={guildId || ""}
                onChange={(value) => onGuildIdChange?.(value)}
                options={
                  guildOptions.length
                    ? guildOptions
                    : [
                        {
                          value: "",
                          label: guildsLoading ? "Loading…" : "No manageable servers",
                          disabled: true,
                        },
                      ]
                }
                placeholder={guildsLoading ? "Loading servers…" : "Select a server"}
                disabled={guildsLoading}
                aria-label="Server"
              />
              {selectedGuild && !selectedGuild.botInGuild && (
                <p className="mt-1.5 text-xs text-[var(--nx-text-muted)]">
                  Bot is not in this server.
                  {selectedGuild.inviteUrl ? (
                    <>
                      {" "}
                      <a
                        href={selectedGuild.inviteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--nx-accent)] hover:underline"
                      >
                        Invite bot
                      </a>
                    </>
                  ) : null}
                </p>
              )}
            </div>

            {showChannels && (
              <div>
                <FieldLabel>{channelLabel}</FieldLabel>
                <Dropdown
                  value={channelId || ""}
                  onChange={(value) => onChannelIdChange?.(value)}
                  options={
                    channelOptions.length
                      ? channelOptions
                      : [
                          {
                            value: "",
                            label: channelsLoading
                              ? "Loading…"
                              : channelsError || "Select a server first",
                            disabled: true,
                          },
                        ]
                  }
                  placeholder={
                    channelsLoading
                      ? "Loading channels…"
                      : channelOptions.length
                        ? "Select a channel"
                        : "No matching channels"
                  }
                  disabled={!guildId || !selectedGuild?.botInGuild || channelsLoading}
                  aria-label={channelLabel}
                />
                {channelsError && (
                  <p className="mt-1.5 text-xs text-[#f0b232]">{channelsError}</p>
                )}
              </div>
            )}

            {typeof children === "function"
              ? children({
                  user,
                  guildId,
                  channelId,
                  selectedGuild,
                  guildReady: Boolean(user && guildId && selectedGuild?.botInGuild),
                  botReady: requireBot
                    ? Boolean(user && guildId && selectedGuild?.botInGuild) && channelReady
                    : Boolean(user),
                  inviteUrl: selectedGuild?.inviteUrl,
                })
              : children}
          </>
        )}
      </div>
  );

  if (bare) return body;

  return (
    <ToolSection title={title} description={description}>
      {body}
    </ToolSection>
  );
}

export function BotActionResult({ result }) {
  if (!result) return null;
  return (
    <div className="space-y-1">
      <p className={cn("text-sm", result.ok ? "text-[#23a559]" : "text-[#f23f43]")}>
        {result.msg}
      </p>
      {result.inviteUrl && (
        <a
          href={result.inviteUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-[var(--nx-accent)] hover:underline"
        >
          Invite bot to this server
        </a>
      )}
    </div>
  );
}
