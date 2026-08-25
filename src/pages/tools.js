import Link from "next/link";
import DiscordAuthButton from "@/components/DiscordAuthButton";
import Logo from "@/components/Logo";
import NexusFooter from "@/components/footer";
import Seo from "@/components/Seo";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import ToolsPage from "@/components/ToolsPage";
import { PAGE_SEO } from "@/lib/seo";

export default function Tools() {
  const seo = PAGE_SEO.tools;
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--nx-bg-deep)]">
      <Seo title={seo.title} description={seo.description} path={seo.path} />
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
        <div className="px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
          <ToolsPage />
        </div>
      </main>

      <NexusFooter />
    </div>
  );
}
