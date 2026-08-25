import { useCallback, useEffect, useState } from "react";
import { X, Send, Lightbulb, Loader2, Check, Ban } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const STATUS_META = {
  pending: { label: "Pending", className: "bg-[var(--nx-accent-soft)] text-[var(--nx-accent)] border-[var(--nx-border-accent)]" },
  planned: { label: "Planned", className: "bg-[var(--nx-green-soft)] text-[var(--nx-green)] border-[var(--nx-border)]" },
  done: { label: "Done", className: "bg-[var(--nx-green-soft)] text-[var(--nx-green)] border-[var(--nx-border)]" },
  declined: { label: "Declined", className: "bg-[var(--nx-red-soft)] text-[var(--nx-red)] border-[var(--nx-border)]" },
};

function formatDate(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return String(value);
  }
}

export default function RequestToolModal({ open, onClose }) {
  const { user, loading: authLoading, login } = useAuth();
  const [tab, setTab] = useState("submit");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitOk, setSubmitOk] = useState(false);
  const [requests, setRequests] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const loadRequests = useCallback(async () => {
    if (!user) {
      setRequests([]);
      setIsOwner(false);
      return;
    }
    setListLoading(true);
    setListError(null);
    try {
      const res = await fetch("/api/tool-requests", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load submissions.");
      setRequests(data.requests || []);
      setIsOwner(Boolean(data.isOwner));
    } catch (err) {
      setListError(err.message || "Could not load submissions.");
      setRequests([]);
      setIsOwner(false);
    } finally {
      setListLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    setTab("submit");
    setSubmitError(null);
    setSubmitOk(false);
    if (user) loadRequests();
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, user, loadRequests]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const updateStatus = async (id, status) => {
    if (!isOwner || updatingId) return;
    setUpdatingId(id);
    setListError(null);
    try {
      const res = await fetch("/api/tool-requests", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update status.");
      setRequests((prev) =>
        prev.map((item) => (item.id === data.request.id ? data.request : item))
      );
    } catch (err) {
      setListError(err.message || "Could not update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    setSubmitOk(false);
    try {
      const res = await fetch("/api/tool-requests", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submit failed.");
      setTitle("");
      setDescription("");
      setSubmitOk(true);
      setRequests((prev) => [data.request, ...prev]);
      setTab("mine");
    } catch (err) {
      setSubmitError(err.message || "Submit failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center nx-modal-overlay p-0 sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-tool-title"
        className="nx-modal max-w-lg w-full max-h-[92dvh] sm:max-h-[90vh] flex flex-col overflow-hidden rounded-t-2xl sm:rounded-[var(--nx-radius-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-4 sm:px-5 pt-4 sm:pt-5 pb-3 border-b border-[var(--nx-border)] shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-[var(--nx-accent-soft)] border border-[var(--nx-border-accent)] flex items-center justify-center shrink-0">
                <Lightbulb className="w-4 h-4 text-[var(--nx-accent)]" />
              </div>
              <h2 id="request-tool-title" className="text-base font-bold text-[var(--nx-text-heading)]">
                Request a tool
              </h2>
            </div>
            <p className="text-xs text-[var(--nx-text-muted)] leading-relaxed">
              Suggest something missing from Nexus — or check the status of ideas you already sent.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center w-9 h-9 rounded-lg text-[var(--nx-text-faint)] hover:text-[var(--nx-text)] hover:bg-[var(--nx-hover-bg)] transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-1 px-4 sm:px-5 pt-3 shrink-0">
          {[
            { id: "submit", label: "Submit" },
            { id: "mine", label: isOwner ? "All submissions" : "Your submissions" },
          ].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                tab === id
                  ? "bg-[var(--nx-accent-soft)] text-[var(--nx-accent)]"
                  : "text-[var(--nx-text-muted)] hover:text-[var(--nx-text)] hover:bg-[var(--nx-hover-bg)]"
              )}
            >
              {label}
              {id === "mine" && requests.length > 0 ? ` (${requests.length})` : ""}
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 py-4">
          {authLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-[var(--nx-text-muted)]">
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking session…
            </div>
          ) : !user ? (
            <div className="rounded-xl border border-[var(--nx-border)] bg-[var(--nx-bg-overlay)] p-5 text-center space-y-3">
              <p className="text-sm text-[var(--nx-text)] font-medium">Log in to request tools</p>
              <p className="text-xs text-[var(--nx-text-muted)] leading-relaxed">
                Discord login lets us save your idea and show you its status later.
              </p>
              <Button type="button" onClick={login} className="w-full sm:w-auto">
                Log in with Discord
              </Button>
            </div>
          ) : tab === "submit" ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label htmlFor="tool-req-title" className="block text-[11px] font-semibold text-[var(--nx-text-muted)] mb-1.5">
                  Tool name
                </label>
                <Input
                  id="tool-req-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, 120))}
                  placeholder="e.g. Role hierarchy visualizer"
                  maxLength={120}
                  required
                />
              </div>
              <div>
                <label htmlFor="tool-req-desc" className="block text-[11px] font-semibold text-[var(--nx-text-muted)] mb-1.5">
                  What should it do?
                </label>
                <textarea
                  id="tool-req-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
                  placeholder="Short description of the problem it solves and what you’d expect to see."
                  rows={5}
                  maxLength={2000}
                  required
                  className="nx-textarea w-full"
                />
                <p className="mt-1 text-[10px] text-[var(--nx-text-faint)] text-right">
                  {description.length}/2000
                </p>
              </div>
              {submitError && (
                <p className="text-xs text-[var(--nx-red)] bg-[var(--nx-red-soft)] border border-[var(--nx-border)] rounded-lg px-3 py-2">
                  {submitError}
                </p>
              )}
              {submitOk && (
                <p className="text-xs text-[var(--nx-green)] bg-[var(--nx-green-soft)] border border-[var(--nx-border)] rounded-lg px-3 py-2">
                  Submitted — you can track it under Your submissions.
                </p>
              )}
              <Button type="submit" disabled={submitting || title.trim().length < 3 || description.trim().length < 10} className="w-full">
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit request
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-[var(--nx-text-muted)]">
                  {isOwner
                    ? "Every tool request submitted on Nexus."
                    : "Requests tied to your Discord account."}
                </p>
                <Button type="button" variant="ghost" size="sm" onClick={loadRequests} disabled={listLoading}>
                  {listLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Refresh"}
                </Button>
              </div>
              {listError && (
                <p className="text-xs text-[var(--nx-red)] bg-[var(--nx-red-soft)] border border-[var(--nx-border)] rounded-lg px-3 py-2">
                  {listError}
                </p>
              )}
              {listLoading && requests.length === 0 ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-[var(--nx-text-muted)]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading…
                </div>
              ) : requests.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--nx-border)] px-4 py-8 text-center">
                  <p className="text-sm text-[var(--nx-text-muted)] mb-2">No submissions yet.</p>
                  <Button type="button" variant="secondary" size="sm" onClick={() => setTab("submit")}>
                    Request your first tool
                  </Button>
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {requests.map((item) => {
                    const meta = STATUS_META[item.status] || STATUS_META.pending;
                    return (
                      <li
                        key={item.id}
                        className="rounded-xl border border-[var(--nx-border)] bg-[var(--nx-bg-overlay)] px-3.5 py-3"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-[var(--nx-text-heading)] leading-snug">
                            {item.title}
                          </h3>
                          <span
                            className={cn(
                              "shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border",
                              meta.className
                            )}
                          >
                            {meta.label}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--nx-text-muted)] leading-relaxed whitespace-pre-wrap">
                          {item.description}
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <p className="text-[10px] text-[var(--nx-text-faint)] min-w-0 truncate">
                            {isOwner && item.username ? `@${item.username} · ` : ""}
                            {formatDate(item.createdAt)}
                          </p>
                          {isOwner && (
                            <div className="flex items-center gap-1.5 shrink-0">
                              {item.status !== "planned" && (
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  disabled={updatingId === item.id}
                                  onClick={() => updateStatus(item.id, "planned")}
                                  className="h-7 px-2 text-[11px]"
                                >
                                  {updatingId === item.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Check className="w-3 h-3" />
                                  )}
                                  Accept
                                </Button>
                              )}
                              {item.status !== "declined" && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  disabled={updatingId === item.id}
                                  onClick={() => updateStatus(item.id, "declined")}
                                  className="h-7 px-2 text-[11px] text-[var(--nx-red)] hover:text-[var(--nx-red)]"
                                >
                                  {updatingId === item.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Ban className="w-3 h-3" />
                                  )}
                                  Decline
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
