import React from "react";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";

export default function ToolPanel({ children, className, fill }) {
  return (
    <div
      className={cn(
        "animate-fade-in flex flex-col",
        fill ? "md:h-full md:min-h-0" : "space-y-4 sm:space-y-6",
        className
      )}
    >
      <div
        className={cn(
          "space-y-3 sm:space-y-5",
          fill && "md:flex-1 md:min-h-0 md:overflow-y-auto md:scrollbar-visible"
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function ToolSection({ title, description, children, className, fill, action }) {
  return (
    <section
      className={cn(
        "nx-card flex flex-col",
        !className?.includes("overflow") && "overflow-hidden",
        fill && "md:h-full md:min-h-0",
        className
      )}
    >
      {(title || description || action) && (
        <div className="nx-section-header flex items-start sm:items-center justify-between gap-2 sm:gap-3 shrink-0">
          <div className="min-w-0 flex-1">
            {title && (
              <h3 className="text-[11px] sm:text-xs font-bold text-[var(--nx-text-heading)] uppercase tracking-[0.08em]">
                {title}
              </h3>
            )}
            {description && typeof description === "string" && (
              <p className="text-[11px] sm:text-xs text-[var(--nx-text-muted)] mt-0.5 leading-snug">
                {description}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div
        className={cn(
          "p-3.5 sm:p-5",
          fill && "md:flex-1 md:min-h-0 md:overflow-y-auto md:scrollbar-visible"
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function StatGrid({ children, className }) {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3", className)}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, accent, mono }) {
  return (
    <div className="nx-stat">
      <p className="nx-stat-label">{label}</p>
      <p
        className={cn(
          "nx-stat-value",
          accent && "text-[var(--nx-accent)]",
          mono && "nx-stat-value-mono"
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function FieldLabel({ children, hint, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="block mb-1.5 sm:mb-2">
      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--nx-text-muted)]">
        {children}
      </span>
      {hint && (
        <span className="block text-[11px] sm:text-xs text-[var(--nx-text-faint)] font-normal normal-case mt-0.5 sm:mt-1 leading-snug">
          {hint}
        </span>
      )}
    </label>
  );
}

export function CopyField({ value, placeholder, label }) {
  const [copied, setCopied] = React.useState(false);

  const copy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div>
      {label && <FieldLabel>{label}</FieldLabel>}
      <div className="flex gap-2 min-w-0 w-full">
        <input
          readOnly
          value={value}
          placeholder={placeholder}
          className="nx-input flex-1 font-mono text-[11px] sm:text-xs !h-10 min-w-0 w-full"
        />
        <CopyButton copied={copied} onClick={copy} disabled={!value} />
      </div>
    </div>
  );
}

function CopyButton({ copied, onClick, disabled, compact }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg font-semibold transition-all shrink-0",
        compact ? "h-8 px-2.5 sm:px-3 text-xs" : "h-10 px-3 sm:px-4 text-xs sm:text-sm",
        copied
          ? "bg-[var(--nx-green-soft)] text-[var(--nx-green)] border border-[var(--nx-green)]/30"
          : "bg-[var(--nx-accent)] hover:bg-[var(--nx-accent-hover)] text-white disabled:opacity-40 disabled:cursor-not-allowed"
      )}
    >
      {copied ? (
        <Check className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
      ) : (
        <Copy className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
      )}
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

function highlightJson(json) {
  return json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(
      /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let color = "var(--nx-text)";
        if (/^"/.test(match)) {
          color = /:$/.test(match) ? "#79c0ff" : "var(--nx-green)";
        } else if (/true|false|null/.test(match)) {
          color = "#ff7b72";
        } else {
          color = "#d2a8ff";
        }
        return `<span style="color:${color}">${match}</span>`;
      }
    );
}

export function CopyCodeBlock({ value, label, description, emptyHint, className }) {
  const [copied, setCopied] = React.useState(false);
  const display = value || "{}";
  const isEmpty = !value || value === "{}";

  const copy = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const lineCount = display.split("\n").length;
  const charCount = display.length;

  return (
    <section className={cn("nx-card overflow-hidden flex flex-col", className)}>
      <div className="nx-section-header flex items-start sm:items-center justify-between gap-2 sm:gap-3 shrink-0">
        <div className="min-w-0">
          {label && (
            <h3 className="text-[11px] sm:text-xs font-bold text-[var(--nx-text-heading)] uppercase tracking-[0.08em]">
              {label}
            </h3>
          )}
          {(description || !isEmpty) && (
            <p className="text-[11px] sm:text-xs text-[var(--nx-text-muted)] mt-0.5">
              {description || `${lineCount} lines · ${charCount} chars`}
            </p>
          )}
        </div>
        <CopyButton copied={copied} onClick={copy} compact />
      </div>
      <div className="p-3.5 sm:p-5 pt-0 flex-1 min-h-0 flex flex-col">
        <div className="rounded-lg border border-[var(--nx-border)] bg-[#0d1117] overflow-hidden flex-1 min-h-[140px] sm:min-h-[180px] max-h-[320px] sm:max-h-[420px] flex flex-col">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--nx-border)] bg-[var(--nx-bg-overlay)] shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-2 text-[10px] font-mono text-[var(--nx-text-faint)]">message.json</span>
          </div>
          <pre className="flex-1 overflow-auto p-3 sm:p-4 text-[11px] sm:text-[12px] leading-relaxed font-mono scrollbar-visible m-0">
            <code
              className="block whitespace-pre text-[var(--nx-text)]"
              dangerouslySetInnerHTML={{ __html: highlightJson(display) }}
            />
          </pre>
        </div>
        {isEmpty && emptyHint && (
          <p className="mt-2 text-[11px] sm:text-xs text-[var(--nx-text-faint)]">{emptyHint}</p>
        )}
      </div>
    </section>
  );
}

export function EmptyState({ icon: Icon, title, description, children }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[160px] sm:min-h-[200px] text-center px-4 sm:px-6">
      {Icon && (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[var(--nx-accent-soft)] border border-[var(--nx-border-accent)] flex items-center justify-center mb-3 sm:mb-4">
          <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--nx-accent)] opacity-80" />
        </div>
      )}
      <p className="text-sm font-semibold text-[var(--nx-text-heading)]">{title}</p>
      {description && (
        <p className="text-xs sm:text-sm text-[var(--nx-text-muted)] mt-1.5 max-w-xs leading-relaxed">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
