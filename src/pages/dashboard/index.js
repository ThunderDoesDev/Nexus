import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  CheckCircle2,
  Crown,
  ExternalLink,
  LogIn,
  RefreshCw,
  Server,
  Shield,
  Wrench,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import ToolPanel, { EmptyState, ToolSection } from "@/components/ToolPanel";
import Seo from "@/components/Seo";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PAGE_SEO } from "@/lib/seo";

function GuildAvatar({ guild, size = "md" }) {
  const dim = size === "lg" ? "w-14 h-14 text-xl" : "w-12 h-12 text-lg";

  if (guild.icon) {
    return (
      <img
        src={guild.icon}
        alt=""
        width={size === "lg" ? 56 : 48}
        height={size === "lg" ? 56 : 48}
        className={cn(dim, "rounded-xl shrink-0 border border-[var(--nx-border)] object-cover")}
      />
    );
  }

  const initial = (guild.name || "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className={cn(
        dim,
        "rounded-xl shrink-0 border border-[var(--nx-border)] bg-[var(--nx-bg-overlay)] flex items-center justify-center font-bold text-[var(--nx-text-muted)]"
      )}
    >
      {initial}
    </div>
  );
}

function GuildCard({ guild, selected, onSelect }) {
  const needsInvite = !guild.botInGuild;
  const sharedClass = cn(
    "flex items-center gap-3 p-3.5 rounded-xl border w-full text-left min-w-0 transition-colors group",
    "bg-[var(--nx-bg-input)]",
    needsInvite && "hover:bg-[var(--nx-hover-bg)] hover:border-[var(--nx-border-strong)] border-[var(--nx-border)]",
    !needsInvite &&
      !selected &&
      "border-[var(--nx-border)] hover:bg-[var(--nx-hover-bg)] hover:border-[var(--nx-border-strong)] cursor-pointer",
    !needsInvite &&
      selected &&
      "border-[var(--nx-accent)] bg-[var(--nx-accent-soft)] ring-1 ring-[var(--nx-accent)]/40 cursor-pointer"
  );

  const body = (
    <>
      <GuildAvatar guild={guild} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span className="font-semibold text-[var(--nx-text-heading)] truncate text-sm">
            {guild.name}
          </span>
          {guild.owner && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[var(--nx-accent)] bg-[var(--nx-accent-soft)] px-1.5 py-0.5 rounded shrink-0">
              <Crown className="w-3 h-3" />
              Owner
            </span>
          )}
          {needsInvite && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[var(--nx-text-muted)] bg-[var(--nx-bg-overlay)] px-1.5 py-0.5 rounded shrink-0 border border-[var(--nx-border)]">
              Bot not added
            </span>
          )}
          {!needsInvite && selected && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[var(--nx-accent)] bg-[var(--nx-bg-base)]/60 px-1.5 py-0.5 rounded shrink-0">
              <CheckCircle2 className="w-3 h-3" />
              Ready
            </span>
          )}
        </div>
        <p className="text-[11px] font-mono text-[var(--nx-text-faint)] truncate mt-0.5">
          {guild.id}
        </p>
      </div>
      {needsInvite ? (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--nx-text-faint)] group-hover:text-[var(--nx-accent)] transition-colors shrink-0">
          Invite
          <ExternalLink className="w-3.5 h-3.5" />
        </span>
      ) : (
        <span
          className={cn(
            "inline-flex items-center gap-1 text-xs font-semibold shrink-0 transition-colors",
            selected
              ? "text-[var(--nx-accent)]"
              : "text-[var(--nx-text-faint)] group-hover:text-[var(--nx-accent)]"
          )}
        >
          {selected ? "Selected" : "Select"}
        </span>
      )}
    </>
  );

  if (needsInvite && guild.inviteUrl) {
    return (
      <a
        href={guild.inviteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={sharedClass}
        title="Open Discord to invite the bot to this server"
      >
        {body}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={sharedClass}
      onClick={() => onSelect?.(guild)}
      aria-pressed={selected}
      title="Bot is in this server — select to use bot tools"
    >
      {body}
    </button>
  );
}

function BotReadyNotice({ guild, onDismiss }) {
  const router = useRouter();
  if (!guild) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 sm:p-4 rounded-xl border border-[var(--nx-accent)]/40 bg-[var(--nx-accent-soft)]">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <CheckCircle2 className="w-5 h-5 text-[var(--nx-accent)] shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--nx-text-heading)]">
            Bot is ready in {guild.name}
          </p>
          <p className="text-xs text-[var(--nx-text-muted)] mt-0.5 leading-snug">
            You can now use bot functions in tools — pick this server when sending with the bot
            (for example Embed Builder → Bot channel).
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 sm:pl-2">
        <Button type="button" size="sm" onClick={() => router.push("/#embed")}>
          <Wrench className="w-3.5 h-3.5" />
          Open tools
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}

function GuildsContent() {
  const {
    user,
    loading: authLoading,
    login,
    guilds,
    guildsLoading,
    guildsError,
    loadGuilds,
  } = useAuth();
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (authLoading || !user) return;
    loadGuilds().catch(() => {});
  }, [authLoading, user, loadGuilds]);

  useEffect(() => {
    if (!selectedId) return;
    const stillThere = (guilds || []).some(
      (g) => String(g.id) === String(selectedId) && g.botInGuild
    );
    if (!stillThere) setSelectedId(null);
  }, [guilds, selectedId]);

  const busy = authLoading || (user && guildsLoading && guilds.length === 0);
  const selectedGuild =
    (guilds || []).find((g) => String(g.id) === String(selectedId) && g.botInGuild) || null;

  return (
    <ToolPanel fill className="h-full min-h-0">
      <div className="flex flex-col md:h-full md:min-h-0 gap-3 sm:gap-5">
        <ToolSection
          fill
          className="min-h-[320px] md:flex-1"
          title="Your servers"
          description={
            user
              ? guilds.length
                ? `${guilds.length} manageable ${guilds.length === 1 ? "server" : "servers"}`
                : "Filtered to Manage Server / Administrator"
              : "Sign in to load guilds"
          }
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => loadGuilds(true).catch(() => {})}
              disabled={!user || guildsLoading}
              aria-label="Refresh guilds"
              title="Refresh guilds"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", guildsLoading && "animate-spin")} />
              Refresh
            </Button>
          }
        >
          {busy ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-[88px] rounded-xl bg-[var(--nx-bg-overlay)] animate-pulse border border-[var(--nx-border)]"
                />
              ))}
            </div>
          ) : !user ? (
            <EmptyState
              icon={Server}
              title="Sign in required"
              description="Log in with Discord to see guilds you can manage."
            >
              <Button type="button" onClick={login} className="mt-4">
                <LogIn className="w-4 h-4" />
                Login with Discord
              </Button>
            </EmptyState>
          ) : guildsError && guilds.length === 0 ? (
            <EmptyState icon={Shield} title="Couldn’t load guilds" description={guildsError}>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => loadGuilds(true).catch(() => {})}
              >
                Try again
              </Button>
            </EmptyState>
          ) : guilds.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="No manageable guilds"
              description="You need Manage Server or Administrator in a server for it to show up here."
            />
          ) : (
            <div className="space-y-3">
              <BotReadyNotice guild={selectedGuild} onDismiss={() => setSelectedId(null)} />
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {guilds.map((guild) => (
                  <GuildCard
                    key={guild.id}
                    guild={guild}
                    selected={String(guild.id) === String(selectedId)}
                    onSelect={(g) =>
                      setSelectedId((prev) =>
                        String(prev) === String(g.id) ? null : g.id
                      )
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </ToolSection>
      </div>
    </ToolPanel>
  );
}

export default function DashboardPage() {
  const seo = PAGE_SEO.dashboard;
  return (
    <AppShell scrollMain={false}>
      <Seo title={seo.title} description={seo.description} path={seo.path} noIndex={seo.noIndex} />
      <div className="min-h-0 md:h-full">
        <GuildsContent />
      </div>
    </AppShell>
  );
}
