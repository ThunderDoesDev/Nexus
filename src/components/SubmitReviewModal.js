import { useCallback, useEffect, useState } from "react";
import { X, Send, Star, Loader2, Check, Ban, MessageSquareQuote } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const STATUS_META = {
  pending: {
    label: "Pending",
    className: "bg-[var(--nx-accent-soft)] text-[var(--nx-accent)] border-[var(--nx-border-accent)]",
  },
  approved: {
    label: "Approved",
    className: "bg-[var(--nx-green-soft)] text-[var(--nx-green)] border-[var(--nx-border)]",
  },
  declined: {
    label: "Declined",
    className: "bg-[var(--nx-red-soft)] text-[var(--nx-red)] border-[var(--nx-border)]",
  },
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

function StarPicker({ value, onChange }) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= value;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            onClick={() => onChange(n)}
            className={cn(
              "p-1 rounded-md transition-colors",
              active
                ? "text-[var(--nx-accent)]"
                : "text-[var(--nx-text-faint)] hover:text-[var(--nx-accent)]"
            )}
          >
            <Star className={cn("w-5 h-5", active && "fill-current")} />
          </button>
        );
      })}
    </div>
  );
}

export default function SubmitReviewModal({ open, onClose }) {
  const { user, loading: authLoading, login } = useAuth();
  const [tab, setTab] = useState("submit");
  const [rating, setRating] = useState(5);
  const [role, setRole] = useState("");
  const [quote, setQuote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitOk, setSubmitOk] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const loadReviews = useCallback(async () => {
    if (!user) {
      setReviews([]);
      setIsOwner(false);
      return;
    }
    setListLoading(true);
    setListError(null);
    try {
      const res = await fetch("/api/reviews?mine=1", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load reviews.");
      setReviews(data.reviews || []);
      setIsOwner(Boolean(data.isOwner));
    } catch (err) {
      setListError(err.message || "Could not load reviews.");
      setReviews([]);
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
    if (user) loadReviews();
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, user, loadReviews]);

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
      const res = await fetch("/api/reviews", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update status.");
      setReviews((prev) =>
        prev.map((item) => (item.id === data.review.id ? data.review : item))
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
      const res = await fetch("/api/reviews", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, role, quote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submit failed.");
      setQuote("");
      setRole("");
      setRating(5);
      setSubmitOk(true);
      setReviews((prev) => [data.review, ...prev]);
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
        aria-labelledby="submit-review-title"
        className="nx-modal max-w-lg w-full max-h-[92dvh] sm:max-h-[90vh] flex flex-col overflow-hidden rounded-t-2xl sm:rounded-[var(--nx-radius-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-4 sm:px-5 pt-4 sm:pt-5 pb-3 border-b border-[var(--nx-border)] shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-[var(--nx-accent-soft)] border border-[var(--nx-border-accent)] flex items-center justify-center shrink-0">
                <MessageSquareQuote className="w-4 h-4 text-[var(--nx-accent)]" />
              </div>
              <h2 id="submit-review-title" className="text-base font-bold text-[var(--nx-text-heading)]">
                Submit a review
              </h2>
            </div>
            <p className="text-xs text-[var(--nx-text-muted)] leading-relaxed">
              Share how Nexus helps you build — approved reviews appear on the home page.
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
            { id: "mine", label: isOwner ? "All reviews" : "Your reviews" },
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
              {id === "mine" && reviews.length > 0 ? ` (${reviews.length})` : ""}
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
              <p className="text-sm text-[var(--nx-text)] font-medium">Log in to leave a review</p>
              <p className="text-xs text-[var(--nx-text-muted)] leading-relaxed">
                Discord login ties the review to your account before it can be approved.
              </p>
              <Button type="button" onClick={login} className="w-full sm:w-auto">
                Log in with Discord
              </Button>
            </div>
          ) : tab === "submit" ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--nx-text-muted)] mb-1.5">
                  Rating
                </label>
                <StarPicker value={rating} onChange={setRating} />
              </div>
              <div>
                <label htmlFor="review-role" className="block text-[11px] font-semibold text-[var(--nx-text-muted)] mb-1.5">
                  Role <span className="font-normal text-[var(--nx-text-faint)]">(optional)</span>
                </label>
                <Input
                  id="review-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value.slice(0, 80))}
                  placeholder="e.g. Bot developer"
                  maxLength={80}
                />
              </div>
              <div>
                <label htmlFor="review-quote" className="block text-[11px] font-semibold text-[var(--nx-text-muted)] mb-1.5">
                  Your review
                </label>
                <textarea
                  id="review-quote"
                  value={quote}
                  onChange={(e) => setQuote(e.target.value.slice(0, 400))}
                  placeholder="What do you use Nexus for, and what works well?"
                  rows={5}
                  maxLength={400}
                  required
                  className="nx-textarea w-full"
                />
                <p className="mt-1 text-[10px] text-[var(--nx-text-faint)] text-right">
                  {quote.length}/400
                </p>
              </div>
              {submitError && (
                <p className="text-xs text-[var(--nx-red)] bg-[var(--nx-red-soft)] border border-[var(--nx-border)] rounded-lg px-3 py-2">
                  {submitError}
                </p>
              )}
              {submitOk && (
                <p className="text-xs text-[var(--nx-green)] bg-[var(--nx-green-soft)] border border-[var(--nx-border)] rounded-lg px-3 py-2">
                  Submitted — we’ll review it before it appears on the home page.
                </p>
              )}
              <Button
                type="submit"
                disabled={submitting || quote.trim().length < 10 || rating < 1}
                className="w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit review
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-[var(--nx-text-muted)]">
                  {isOwner
                    ? "Every review submitted on Nexus."
                    : "Reviews tied to your Discord account."}
                </p>
                <Button type="button" variant="ghost" size="sm" onClick={loadReviews} disabled={listLoading}>
                  {listLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Refresh"}
                </Button>
              </div>
              {listError && (
                <p className="text-xs text-[var(--nx-red)] bg-[var(--nx-red-soft)] border border-[var(--nx-border)] rounded-lg px-3 py-2">
                  {listError}
                </p>
              )}
              {listLoading && reviews.length === 0 ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-[var(--nx-text-muted)]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading…
                </div>
              ) : reviews.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--nx-border)] px-4 py-8 text-center">
                  <p className="text-sm text-[var(--nx-text-muted)] mb-2">No reviews yet.</p>
                  <Button type="button" variant="secondary" size="sm" onClick={() => setTab("submit")}>
                    Write your first review
                  </Button>
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {reviews.map((item) => {
                    const meta = STATUS_META[item.status] || STATUS_META.pending;
                    return (
                      <li
                        key={item.id}
                        className="rounded-xl border border-[var(--nx-border)] bg-[var(--nx-bg-overlay)] px-3.5 py-3"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-0.5" aria-label={`${item.rating} out of 5 stars`}>
                            {Array.from({ length: item.rating }).map((_, i) => (
                              <Star
                                key={i}
                                className="w-3.5 h-3.5 fill-[var(--nx-accent)] text-[var(--nx-accent)]"
                                aria-hidden
                              />
                            ))}
                          </div>
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
                          {item.quote}
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <p className="text-[10px] text-[var(--nx-text-faint)] min-w-0 truncate">
                            {isOwner && item.username ? `@${item.username}` : ""}
                            {isOwner && item.username && item.role ? " · " : ""}
                            {item.role || ""}
                            {(isOwner && item.username) || item.role ? " · " : ""}
                            {formatDate(item.createdAt)}
                          </p>
                          {isOwner && (
                            <div className="flex items-center gap-1.5 shrink-0">
                              {item.status !== "approved" && (
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  disabled={updatingId === item.id}
                                  onClick={() => updateStatus(item.id, "approved")}
                                  className="h-7 px-2 text-[11px]"
                                >
                                  {updatingId === item.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Check className="w-3 h-3" />
                                  )}
                                  Approve
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
