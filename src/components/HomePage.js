import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  ArrowRight,
  Check,
  Code2,
  FolderKanban,
  Layers,
  MousePointerClick,
  Quote,
  Server,
  Sparkles,
  Star,
  Wrench,
  Zap,
} from "lucide-react";
import Logo from "./Logo";
import { TOOLS, TOOL_GROUPS } from "./Sidebar";
import { TOOL_META } from "./ToolsPage";

const PILLARS = [
  {
    icon: Zap,
    title: "Zero setup",
    body: "Open a tool and start working. No installs, API keys, or sign-up walls.",
  },
  {
    icon: Layers,
    title: "All-in-one",
    body: "Permissions, invites, embeds, flags, mentions, CDN — one consistent workspace.",
  },
  {
    icon: Code2,
    title: "Copy-ready",
    body: "Every tool is built to give you values and JSON you can paste into Discord.",
  },
];

const STEPS = [
  {
    icon: MousePointerClick,
    title: "Pick a tool",
    body: "Browse grouped utilities for access, identity, messages, and assets.",
  },
  {
    icon: Sparkles,
    title: "Configure",
    body: "Use toggles, inputs, and live previews — no docs tab-switching.",
  },
  {
    icon: Check,
    title: "Copy & ship",
    body: "Grab the integer, URL, mention, or JSON and drop it into your bot.",
  },
];

const REVIEWS = [
  {
    quote: "Permission calculator alone saved me from another wrong bitfield in production. Everything just copies clean.",
    name: "Maya Chen",
    role: "Bot developer",
    rating: 5,
  },
  {
    quote: "Embed builder with a live preview means I stop bouncing between Discord and half-finished JSON.",
    name: "Jordan Ellis",
    role: "Server admin",
    rating: 5,
  },
  {
    quote: "Snowflake, CDN, mentions — all in one place. Feels like the toolkit I always wished Discord shipped.",
    name: "Alex Rivera",
    role: "Moderation lead",
    rating: 5,
  },
];

const toolItems = TOOLS.filter((t) => t.id !== "home");
const toolMap = Object.fromEntries(toolItems.map((t) => [t.id, t]));
const marqueeItems = [...toolItems, ...toolItems];
const newCount = toolItems.filter((t) => TOOL_META[t.id]?.tag === "New").length;

const FEATURED_IDS = ["permissions", "embed", "user", "snowflake", "oauth", "cdn"];
const featuredTools = FEATURED_IDS.map((id) => toolMap[id]).filter(Boolean);

export default function HomePage() {
  const router = useRouter();
  const [guildCount, setGuildCount] = useState(null);
  const [reviews, setReviews] = useState(REVIEWS);
  const openTools = () => router.push("/tools");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/site-stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || data?.guilds == null) return;
        setGuildCount(data.guilds);
      })
      .catch(() => {});

    fetch("/api/reviews")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !Array.isArray(data?.reviews) || data.reviews.length === 0) return;
        setReviews(data.reviews);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = [
    { label: "Tools", value: toolItems.length, icon: Wrench },
    { label: "Categories", value: TOOL_GROUPS.length, icon: FolderKanban },
    { label: "New", value: newCount, icon: Sparkles },
    { label: "Guilds", value: guildCount ?? "—", icon: Server },
  ];

  return (
    <div className="animate-fade-in w-full">
      <section className="nx-home-hero border-b border-[var(--nx-border)]">
        <div className="nx-home-hero-visual">
          <div className="absolute inset-0 nx-mesh" />
          <div className="absolute inset-0 nx-grid-bg" />
        </div>

        <div className="nx-home-hero-content max-w-4xl mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-12 lg:py-14 text-center">
          <Logo className="h-20 sm:h-24 w-auto mb-5 mx-auto nx-home-float" />

          <h1 className="nx-display text-lg sm:text-xl lg:text-2xl font-bold text-[var(--nx-text-heading)] mb-3">
            The <span className="nx-gradient-accent">advanced</span> Discord toolkit
          </h1>

          <p className="text-sm sm:text-base text-[var(--nx-text-muted)] max-w-md leading-relaxed mb-6 mx-auto">
            Permissions, invites, embeds, flags, mentions, and CDN assets — fast, local, and copy-ready.
          </p>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={openTools}
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-[var(--nx-accent)] hover:bg-[var(--nx-accent-hover)] text-white font-semibold transition-all"
            >
              Browse
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--nx-border)] bg-[var(--nx-bg-deep)] py-2.5 overflow-hidden">
        <div className="flex whitespace-nowrap">
          <div className="flex nx-home-marquee-track">
            {marqueeItems.map((tool, i) => (
              <span
                key={`${tool.id}-${i}`}
                className="inline-flex items-center gap-2.5 px-5 text-xs text-[var(--nx-text-faint)]"
              >
                <tool.icon className="w-3.5 h-3.5 text-[var(--nx-accent)] opacity-70" />
                {tool.label}
                <span className="w-1 h-1 rounded-full bg-[var(--nx-border-strong)]" />
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--nx-border)] py-8 sm:py-10">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {stats.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="rounded-xl border border-[var(--nx-border)] bg-[var(--nx-bg-surface)] px-3 py-3 sm:px-4 sm:py-3.5 text-center sm:text-left"
              >
                <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5 text-[var(--nx-accent)]" />
                  <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--nx-text-faint)]">
                    {label}
                  </span>
                </div>
                <p className="nx-display text-2xl sm:text-3xl font-extrabold text-[var(--nx-text-heading)] tabular-nums leading-none">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-6 sm:py-8 bg-[var(--nx-bg-deep)] border-b border-[var(--nx-border)]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-12 grid lg:grid-cols-2 gap-6 lg:gap-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--nx-accent)] mb-1">Why Nexus</p>
            <h2 className="nx-display text-2xl font-extrabold text-[var(--nx-text-heading)] mb-3">
              Built for how you ship
            </h2>
            <div className="space-y-3">
              {PILLARS.map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[var(--nx-accent-soft)] border border-[var(--nx-border-accent)] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[var(--nx-accent)]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--nx-text-heading)] mb-0.5">{title}</h3>
                    <p className="text-xs text-[var(--nx-text-muted)] leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--nx-accent)] mb-1">Workflow</p>
            <h2 className="nx-display text-2xl font-extrabold text-[var(--nx-text-heading)] mb-3">
              Three steps to done
            </h2>
            <ol className="space-y-2.5">
              {STEPS.map(({ icon: Icon, title, body }, i) => (
                <li key={title} className="flex gap-3">
                  <div className="flex items-center gap-2 shrink-0 w-14">
                    <span className="text-[10px] font-bold text-[var(--nx-text-faint)] tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-[var(--nx-bg-input)] border border-[var(--nx-border)] flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5 text-[var(--nx-accent)]" />
                    </div>
                  </div>
                  <div className="pt-0.5">
                    <h3 className="text-sm font-bold text-[var(--nx-text-heading)] mb-0.5">{title}</h3>
                    <p className="text-xs text-[var(--nx-text-muted)] leading-relaxed">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--nx-border)] bg-[var(--nx-bg-base)] py-8 sm:py-10">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--nx-accent)] mb-1">Reviews</p>
            <h2 className="nx-display text-2xl font-extrabold text-[var(--nx-text-heading)] mb-1">
              Loved by Discord builders
            </h2>
            <p className="text-sm text-[var(--nx-text-muted)] max-w-lg">
              What developers and admins say after shipping with Nexus.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {reviews.slice(0, 3).map(({ quote, name, role, rating, id, image }) => (
              <figure
                key={id ?? name}
                className="flex flex-col rounded-xl border border-[var(--nx-border)] bg-[var(--nx-bg-surface)] p-4 sm:p-5"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Quote className="w-4 h-4 text-[var(--nx-accent)] opacity-80" aria-hidden />
                  <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-3.5 h-3.5 fill-[var(--nx-accent)] text-[var(--nx-accent)]"
                        aria-hidden
                      />
                    ))}
                  </div>
                </div>
                <blockquote className="text-sm text-[var(--nx-text)] leading-relaxed flex-1 mb-4">
                  “{quote}”
                </blockquote>
                <figcaption className="flex items-center gap-2.5 min-w-0">
                  {image ? (
                    <img
                      src={image}
                      alt=""
                      width={28}
                      height={28}
                      className="w-7 h-7 rounded-full shrink-0 border border-[var(--nx-border)]"
                    />
                  ) : null}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--nx-text-heading)] truncate">{name}</p>
                    {role ? <p className="text-xs text-[var(--nx-text-muted)] truncate">{role}</p> : null}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-[var(--nx-border)]">
        <div className="absolute inset-0 nx-mesh opacity-25 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-5 sm:px-8 lg:px-12 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--nx-accent)] mb-1">Start here</p>
              <h2 className="nx-display text-2xl font-extrabold text-[var(--nx-text-heading)]">
                Popular tools
              </h2>
            </div>
            <button
              type="button"
              onClick={openTools}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--nx-accent)] hover:text-[var(--nx-accent-hover)] transition-colors self-start sm:self-auto"
            >
              View all {toolItems.length}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 mb-8">
            {featuredTools.map((tool) => {
              const Icon = tool.icon;
              const meta = TOOL_META[tool.id];
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => router.push(`/#${tool.id}`)}
                  className="group flex items-start gap-3 p-3.5 rounded-xl border border-[var(--nx-border)] bg-[var(--nx-bg-surface)] text-left hover:border-[var(--nx-border-accent)] hover:bg-[var(--nx-hover-bg)] transition-colors"
                >
                  <span className="nx-nav-icon w-9 h-9 group-hover:bg-[var(--nx-accent)] transition-all shrink-0">
                    <Icon className="w-4 h-4 text-[var(--nx-text-muted)] group-hover:text-white transition-colors" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-[var(--nx-text-heading)]">{tool.label}</span>
                      {meta?.tag && <span className="nx-badge">{meta.tag}</span>}
                    </span>
                    <span className="block text-xs text-[var(--nx-text-muted)] leading-snug mt-0.5">
                      {meta?.blurb || tool.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-[var(--nx-border)] bg-[var(--nx-bg-surface)] px-5 py-5 sm:px-6">
            <div>
              <h3 className="nx-display text-lg sm:text-xl font-extrabold text-[var(--nx-text-heading)] mb-1">
                Open the full toolkit
              </h3>
              <p className="text-sm text-[var(--nx-text-muted)] leading-relaxed max-w-md">
                Search every utility by category — builders, lookups, and converters in one place.
              </p>
            </div>
            <button
              type="button"
              onClick={openTools}
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-[var(--nx-accent)] hover:bg-[var(--nx-accent-hover)] text-white font-semibold shrink-0 transition-all"
            >
              Browse tools
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
