import { useEffect, useMemo, useState } from "react";
import { Check, ExternalLink, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";
import ToolPanel, { ToolSection, FieldLabel, StatGrid, StatCard } from "../ToolPanel";
import { AD_TYPES, SERVER_AD_CHECKLIST } from "../../lib/serverAds";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "nexus-server-ads-checked";

function loadChecked() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

export default function ServerAdsTool() {
  const [type, setType] = useState("All");
  const [checked, setChecked] = useState({});

  useEffect(() => {
    setChecked(loadChecked());
  }, []);

  const items = useMemo(
    () => (type === "All" ? SERVER_AD_CHECKLIST : SERVER_AD_CHECKLIST.filter((i) => i.type === type)),
    [type]
  );

  const done = SERVER_AD_CHECKLIST.filter((i) => checked[i.id]).length;

  const toggle = (id) => {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const reset = () => {
    setChecked({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  return (
    <ToolPanel fill>
      <StatGrid>
        <StatCard label="Listed" value={String(SERVER_AD_CHECKLIST.length)} />
        <StatCard label="Checked" value={String(done)} accent />
        <StatCard
          label="Progress"
          value={`${Math.round((done / SERVER_AD_CHECKLIST.length) * 100)}%`}
        />
        <StatCard label="Filter" value={type} />
      </StatGrid>

      <ToolSection
        title="Server advertising checklist"
        description="Directories, communities, and channels where you can promote a Discord server"
        action={
          <Button type="button" variant="secondary" size="sm" onClick={reset}>
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>
        }
      >
        <FieldLabel>Type</FieldLabel>
        <div className="flex flex-wrap gap-2 mb-4">
          {AD_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
                type === t
                  ? "bg-[var(--nx-accent-soft)] border-[var(--nx-border-accent)] text-[var(--nx-text-heading)]"
                  : "border-[var(--nx-border)] text-[var(--nx-text-muted)] hover:bg-[var(--nx-hover-bg)]"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {items.map((item) => {
            const isOn = Boolean(checked[item.id]);
            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl border transition-colors",
                  isOn
                    ? "border-[var(--nx-border-accent)] bg-[var(--nx-accent-soft)]/40"
                    : "border-[var(--nx-border)] bg-[var(--nx-bg-input)]"
                )}
              >
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className={cn(
                    "mt-0.5 flex items-center justify-center w-6 h-6 rounded-md border shrink-0",
                    isOn
                      ? "bg-[var(--nx-accent)] border-[var(--nx-accent)] text-white"
                      : "border-[var(--nx-border-strong)] bg-[var(--nx-bg-surface)]"
                  )}
                  aria-pressed={isOn}
                  aria-label={isOn ? "Mark incomplete" : "Mark done"}
                >
                  {isOn && <Check className="w-3.5 h-3.5" />}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-[var(--nx-text-heading)]">{item.name}</span>
                    <span className="nx-badge">{item.type}</span>
                  </div>
                  <p className="text-xs text-[var(--nx-text-muted)] mt-1 leading-relaxed">{item.notes}</p>
                </div>

                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--nx-accent)] hover:underline shrink-0 mt-0.5"
                  >
                    Open <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-xs text-[var(--nx-text-faint)]">
          Always follow each site’s rules and Discord’s Terms of Service — no spam or unsolicited DMs.
        </p>
      </ToolSection>
    </ToolPanel>
  );
}
