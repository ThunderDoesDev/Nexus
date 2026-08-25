import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Copy, ExternalLink, LogOut, MessageSquareQuote, Server } from "lucide-react";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

function DiscordIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function MenuItem({ icon: Icon, label, onClick, destructive = false, trailing }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium transition-colors rounded-lg",
        destructive
          ? "text-[var(--nx-red)] hover:bg-[var(--nx-red)]/10"
          : "text-[var(--nx-text)] hover:bg-[var(--nx-hover-bg)]"
      )}
    >
      <Icon className="w-4 h-4 shrink-0 opacity-80" />
      <span className="flex-1 text-left truncate">{label}</span>
      {trailing}
    </button>
  );
}

export default function DiscordAuthButton({
  compact = false,
  side = "bottom",
  className,
  onSubmitReview,
}) {
  const { user, loading, login, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleClick = (e) => {
      if (panelRef.current?.contains(e.target)) return;
      setOpen(false);
    };

    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  useEffect(() => {
    if (!copied) return undefined;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  if (loading) {
    return (
      <div
        className={cn(
          "h-9 rounded-lg bg-[var(--nx-bg-overlay)] animate-pulse",
          compact ? "w-9" : "w-full min-w-[140px]",
          className
        )}
        aria-hidden
      />
    );
  }

  if (!user) {
    return (
      <Button
        type="button"
        variant={compact ? "outline" : "default"}
        size={compact ? "icon" : "default"}
        onClick={login}
        aria-label="Login with Discord"
        title="Login with Discord"
        className={cn(!compact && "w-full", className)}
      >
        <DiscordIcon className="w-4 h-4" />
        {!compact && <span>Login with Discord</span>}
      </Button>
    );
  }

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(user.id);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const openProfile = () => {
    window.open(`https://discord.com/users/${user.id}`, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  return (
    <div className={cn("relative", !compact && "w-full", className)} ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className={cn(
          "flex items-center gap-2 min-w-0 rounded-lg transition-colors",
          compact
            ? "h-9 w-9 justify-center hover:bg-[var(--nx-hover-bg)]"
            : "w-full h-10 px-2 border border-[var(--nx-border)] bg-[var(--nx-bg-surface)] hover:bg-[var(--nx-hover-bg)]",
          open && "bg-[var(--nx-hover-bg)]"
        )}
      >
        <img
          src={user.image}
          alt=""
          width={28}
          height={28}
          className="w-7 h-7 rounded-full shrink-0 border border-[var(--nx-border)]"
        />
        {!compact && (
          <>
            <span className="flex-1 min-w-0 text-left text-[13px] font-semibold text-[var(--nx-text)] truncate">
              {user.name}
            </span>
            <ChevronDown
              className={cn(
                "w-4 h-4 shrink-0 text-[var(--nx-text-faint)] transition-transform",
                open && "rotate-180"
              )}
            />
          </>
        )}
      </button>

      {open && (
        <div
          className={cn(
            "absolute z-[70] w-56 nx-card p-1.5 shadow-[var(--nx-shadow-md)] animate-fade-in",
            compact ? "right-0" : "left-0 right-0 w-auto",
            side === "top" ? "bottom-full mb-2" : "top-full mt-2"
          )}
          role="menu"
          aria-label="Account"
        >
          <div className="flex items-center gap-2.5 px-2.5 py-2 mb-1 border-b border-[var(--nx-border)]">
            <img
              src={user.image}
              alt=""
              width={36}
              height={36}
              className="w-9 h-9 rounded-full shrink-0 border border-[var(--nx-border)]"
            />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[var(--nx-text-heading)] truncate">
                {user.name}
              </p>
              <p className="text-[11px] text-[var(--nx-text-faint)] font-mono truncate">{user.id}</p>
            </div>
          </div>

          <MenuItem
            icon={copied ? Check : Copy}
            label={copied ? "Copied ID" : "Copy user ID"}
            onClick={copyId}
          />
          <MenuItem icon={ExternalLink} label="Open Discord profile" onClick={openProfile} />
          <MenuItem
            icon={Server}
            label="Manage guilds"
            onClick={() => {
              setOpen(false);
              router.push("/dashboard");
            }}
          />
          {onSubmitReview && (
            <MenuItem
              icon={MessageSquareQuote}
              label="Submit a review"
              onClick={() => {
                setOpen(false);
                onSubmitReview();
              }}
            />
          )}

          <div className="my-1 border-t border-[var(--nx-border)]" />

          <MenuItem
            icon={LogOut}
            label="Log out"
            destructive
            onClick={() => {
              setOpen(false);
              logout();
            }}
          />
        </div>
      )}
    </div>
  );
}
