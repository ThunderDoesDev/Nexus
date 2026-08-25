import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Input } from "../ui/input";
import ToolPanel, {
  ToolSection,
  FieldLabel,
  StatGrid,
  StatCard,
} from "../ToolPanel";
import {
  COOKBOOK_CATEGORIES,
  COOKBOOK_ENTRIES,
  buildCurl,
  buildFetch,
} from "../../lib/apiCookbook";
import { cn } from "@/lib/utils";

function Snippet({ title, value }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-lg border border-[var(--nx-border)] overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-[var(--nx-border)] bg-[var(--nx-bg-overlay)]">
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--nx-text-muted)]">
          {title}
        </span>
        <button
          type="button"
          onClick={copy}
          className={cn(
            "inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-md",
            copied
              ? "bg-[var(--nx-green-soft)] text-[var(--nx-green)]"
              : "text-[var(--nx-accent)] hover:bg-[var(--nx-accent-soft)]"
          )}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-3 text-[11px] sm:text-xs font-mono leading-relaxed overflow-auto max-h-[280px] scrollbar-visible m-0 bg-[#0d1117] text-[#e6edf3]">
        <code className="whitespace-pre">{value}</code>
      </pre>
    </div>
  );
}

export default function CookbookTool() {
  const [category, setCategory] = useState("commands");
  const [selectedId, setSelectedId] = useState("bulk-global-commands");
  const [vars, setVars] = useState({
    applicationId: "",
    guildId: "",
    channelId: "",
    messageId: "",
    webhookId: "",
    webhookToken: "",
    interactionId: "",
    interactionToken: "",
    templateCode: "",
    token: "",
  });
  const [snippet, setSnippet] = useState("curl");

  const entries = useMemo(
    () => COOKBOOK_ENTRIES.filter((e) => e.category === category),
    [category]
  );

  const entry = COOKBOOK_ENTRIES.find((e) => e.id === selectedId) || entries[0];

  const curl = useMemo(() => (entry ? buildCurl(entry, vars) : ""), [entry, vars]);
  const fetchCode = useMemo(() => (entry ? buildFetch(entry, vars) : ""), [entry, vars]);

  const selectCategory = (id) => {
    setCategory(id);
    const first = COOKBOOK_ENTRIES.find((e) => e.category === id);
    if (first) setSelectedId(first.id);
  };

  return (
    <ToolPanel fill>
      <StatGrid>
        <StatCard label="Endpoints" value={COOKBOOK_ENTRIES.length} accent />
        <StatCard label="Category" value={COOKBOOK_CATEGORIES.find((c) => c.id === category)?.label || "—"} />
        <StatCard label="Method" value={entry?.method || "—"} />
        <StatCard label="Auth" value={entry?.noBotAuth ? "Token/none" : "Bot"} />
      </StatGrid>

      <div className="flex flex-wrap gap-2 mb-1">
        {COOKBOOK_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => selectCategory(c.id)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
              category === c.id
                ? "bg-[var(--nx-accent-soft)] border-[var(--nx-border-accent)] text-[var(--nx-text-heading)]"
                : "border-[var(--nx-border)] text-[var(--nx-text-muted)] hover:bg-[var(--nx-hover-bg)]"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4">
        <ToolSection title="Endpoints" description="Common Discord REST routes">
          <div className="space-y-1.5 max-h-[520px] overflow-y-auto scrollbar-visible pr-1">
            {entries.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => setSelectedId(e.id)}
                className={cn(
                  "nx-selectable w-full text-left py-2 px-3",
                  entry?.id === e.id && "nx-selectable-active"
                )}
              >
                <span className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--nx-accent)]">
                    {e.method}
                  </span>
                  <span className="text-[13px] font-semibold text-[var(--nx-text-heading)] truncate">
                    {e.title}
                  </span>
                </span>
                <span className="block text-[11px] font-mono text-[var(--nx-text-faint)] truncate">
                  {e.path}
                </span>
              </button>
            ))}
          </div>
        </ToolSection>

        <div className="xl:col-span-2 space-y-3 sm:space-y-4">
          {entry && (
            <ToolSection title={entry.title} description={entry.description}>
              <p className="text-xs font-mono text-[var(--nx-accent)] mb-4 break-all">
                {entry.method} {entry.path}
              </p>

              <FieldLabel>Path variables (optional)</FieldLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {[
                  ["applicationId", "Application ID"],
                  ["guildId", "Guild ID"],
                  ["channelId", "Channel ID"],
                  ["messageId", "Message ID"],
                  ["webhookId", "Webhook ID"],
                  ["webhookToken", "Webhook token"],
                  ["interactionId", "Interaction ID"],
                  ["interactionToken", "Interaction token"],
                  ["templateCode", "Template code"],
                  ["token", "Bot token (display only)"],
                ].map(([key, label]) => (
                  <Input
                    key={key}
                    value={vars[key]}
                    onChange={(e) => setVars((v) => ({ ...v, [key]: e.target.value }))}
                    placeholder={label}
                    className="font-mono text-xs"
                  />
                ))}
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  { id: "curl", label: "cURL" },
                  { id: "fetch", label: "fetch" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSnippet(s.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold border",
                      snippet === s.id
                        ? "bg-[var(--nx-accent-soft)] border-[var(--nx-border-accent)]"
                        : "border-[var(--nx-border)] text-[var(--nx-text-muted)]"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <Snippet
                title={snippet === "curl" ? "cURL" : "fetch"}
                value={snippet === "curl" ? curl : fetchCode}
              />

              {entry.body && (
                <div className="mt-4">
                  <Snippet title="Example body" value={entry.body} />
                </div>
              )}
            </ToolSection>
          )}
        </div>
      </div>
    </ToolPanel>
  );
}
