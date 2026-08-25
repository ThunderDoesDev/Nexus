import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import AppShell from "./AppShell";
import DiscordAuthButton from "./DiscordAuthButton";
import HomePage from "./HomePage";
import Logo from "./Logo";
import NexusFooter from "./footer";
import Seo from "./Seo";
import ThemeSwitcher from "./ThemeSwitcher";
import { TOOLS } from "./Sidebar";
import { TOOL_META } from "./ToolsPage";
import { DEFAULT_DESCRIPTION, PAGE_SEO } from "@/lib/seo";
import PermissionsTool from "./tools/PermissionsTool";
import OAuthTool from "./tools/OAuthTool";
import ApplicationLookupTool from "./tools/ApplicationLookupTool";
import SnowflakeTool from "./tools/SnowflakeTool";
import PermissionDecoderTool from "./tools/PermissionDecoderTool";
import EmbedBuilderTool from "./tools/EmbedBuilderTool";
import SlashCommandTool from "./tools/SlashCommandTool";
import MarkdownTool from "./tools/MarkdownTool";
import IntentsTool from "./tools/IntentsTool";
import WebhookTool from "./tools/WebhookTool";
import ColorTool from "./tools/ColorTool";
import TimestampTool from "./tools/TimestampTool";
import FlagsTool from "./tools/FlagsTool";
import MentionsTool from "./tools/MentionsTool";
import MessageLinkTool from "./tools/MessageLinkTool";
import CdnTool from "./tools/CdnTool";
import WidgetsTool from "./tools/WidgetsTool";
import ComponentsTool from "./tools/ComponentsTool";
import OverwriteTool from "./tools/OverwriteTool";
import InviteTool from "./tools/InviteTool";
import VanityCheckerTool from "./tools/VanityCheckerTool";
import UsernameCheckerTool from "./tools/UsernameCheckerTool";
import UsernameHistoryTool from "./tools/UsernameHistoryTool";
import UserLookupTool from "./tools/UserLookupTool";
import GuildLookupTool from "./tools/GuildLookupTool";
import FeaturesTool from "./tools/FeaturesTool";
import PollTool from "./tools/PollTool";
import InteractionTool from "./tools/InteractionTool";
import LimitsTool from "./tools/LimitsTool";
import CodeExportTool from "./tools/CodeExportTool";
import EffectivePermsTool from "./tools/EffectivePermsTool";
import LocalizationsTool from "./tools/LocalizationsTool";
import TemplateTool from "./tools/TemplateTool";
import AutomodTool from "./tools/AutomodTool";
import PresenceTool from "./tools/PresenceTool";
import ScheduledEventTool from "./tools/ScheduledEventTool";
import CookbookTool from "./tools/CookbookTool";
import FontGeneratorTool from "./tools/FontGeneratorTool";
import SpoilerTool from "./tools/SpoilerTool";
import StatusIdeasTool from "./tools/StatusIdeasTool";
import FakeMessageTool from "./tools/FakeMessageTool";
import PfpRingTool from "./tools/PfpRingTool";
import FakePingTool from "./tools/FakePingTool";
import AnsiTextTool from "./tools/AnsiTextTool";
import ServerAdsTool from "./tools/ServerAdsTool";
import AutomodRegexTool from "./tools/AutomodRegexTool";

const TOOL_COMPONENTS = {
  permissions: PermissionsTool,
  oauth: OAuthTool,
  application: ApplicationLookupTool,
  user: UserLookupTool,
  "username-history": UsernameHistoryTool,
  guild: GuildLookupTool,
  snowflake: SnowflakeTool,
  decoder: PermissionDecoderTool,
  embed: EmbedBuilderTool,
  slash: SlashCommandTool,
  markdown: MarkdownTool,
  intents: IntentsTool,
  webhook: WebhookTool,
  color: ColorTool,
  timestamp: TimestampTool,
  flags: FlagsTool,
  mentions: MentionsTool,
  links: MessageLinkTool,
  cdn: CdnTool,
  widgets: WidgetsTool,
  components: ComponentsTool,
  overwrites: OverwriteTool,
  invite: InviteTool,
  vanity: VanityCheckerTool,
  username: UsernameCheckerTool,
  features: FeaturesTool,
  poll: PollTool,
  interactions: InteractionTool,
  limits: LimitsTool,
  export: CodeExportTool,
  effective: EffectivePermsTool,
  localizations: LocalizationsTool,
  template: TemplateTool,
  automod: AutomodTool,
  "automod-regex": AutomodRegexTool,
  "server-ads": ServerAdsTool,
  presence: PresenceTool,
  events: ScheduledEventTool,
  cookbook: CookbookTool,
  font: FontGeneratorTool,
  spoiler: SpoilerTool,
  "status-ideas": StatusIdeasTool,
  "fake-message": FakeMessageTool,
  "pfp-ring": PfpRingTool,
  "fake-ping": FakePingTool,
  ansi: AnsiTextTool,
};

function toolFromHash() {
  if (typeof window === "undefined") return "home";
  const id = window.location.hash.replace(/^#/, "");
  if (id === "bot") {
    syncHash("application");
    return "application";
  }
  if (id === "avatar" || id === "banner") {
    syncHash("cdn");
    return "cdn";
  }
  return TOOL_COMPONENTS[id] ? id : "home";
}

function syncHash(id) {
  const next = TOOL_COMPONENTS[id] ? id : "home";
  const hash = next === "home" ? "" : `#${next}`;
  const current = window.location.hash || "";
  if (current === hash) return;
  const url = `${window.location.pathname}${window.location.search}${hash}`;
  window.history.replaceState(null, "", url);
}

export default function NexusApp() {
  const router = useRouter();
  const [activeTool, setActiveToolState] = useState("home");

  useLayoutEffect(() => {
    setActiveToolState(toolFromHash());
  }, []);

  useEffect(() => {
    const onHashChange = () => setActiveToolState(toolFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const setActiveTool = useCallback(
    (id) => {
      if (id === "home") {
        router.push("/tools");
        return;
      }
      const next = TOOL_COMPONENTS[id] ? id : "home";
      setActiveToolState(next);
      syncHash(next);
    },
    [router]
  );

  const ActiveComponent = TOOL_COMPONENTS[activeTool];
  const isHome = activeTool === "home" || !ActiveComponent;

  const seo = useMemo(() => {
    if (isHome) return PAGE_SEO.home;
    const tool = TOOLS.find((t) => t.id === activeTool);
    const meta = TOOL_META[activeTool];
    const label = tool?.label || "Tool";
    const description = meta?.blurb || tool?.description || DEFAULT_DESCRIPTION;
    return {
      title: label,
      description,
      path: `/#${activeTool}`,
    };
  }, [activeTool, isHome]);

  return (
    <>
      <Seo title={seo.title} description={seo.description} path={seo.path} />
      {isHome ? (
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--nx-bg-deep)]">
          <header className="shrink-0 relative z-[60] nx-glass-strong border-b border-[var(--nx-border)]">
            <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-8 h-[56px] md:h-[64px]">
              <Link href="/" className="flex items-center gap-2.5 min-w-0 rounded-lg hover:opacity-90 transition-opacity">
                <Logo className="h-8 md:h-9 w-auto" />
                <span className="nx-wordmark text-base md:text-lg">Nexus</span>
              </Link>
              <div className="ml-auto flex items-center gap-2">
                <DiscordAuthButton compact className="shrink-0" />
                <ThemeSwitcher />
              </div>
            </div>
          </header>

          <main className="flex-1 min-h-0 overflow-y-auto scrollbar-visible nx-ambient bg-[var(--nx-bg-base)]">
            <HomePage />
          </main>

          <NexusFooter />
        </div>
      ) : (
        <AppShell activeTool={activeTool} onToolChange={setActiveTool} scrollMain={false}>
          <div className="min-h-0 md:h-full">
            <ActiveComponent />
          </div>
        </AppShell>
      )}
    </>
  );
}
