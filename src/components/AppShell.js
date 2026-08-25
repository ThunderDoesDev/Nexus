import { useCallback, useState } from "react";
import { useRouter } from "next/router";
import Sidebar from "./Sidebar";
import NexusFooter from "./footer";
import RequestToolModal from "./RequestToolModal";
import SubmitReviewModal from "./SubmitReviewModal";
import { NexusProvider } from "@/context/NexusContext";

/**
 * Shared chrome (sidebar + footer) for toolkit and dashboard routes.
 * When `onToolChange` is omitted, Home goes to `/tools` and tools to `/#tool`.
 */
export default function AppShell({ children, activeTool = null, onToolChange, scrollMain = true }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const handleToolChange = useCallback(
    (id) => {
      if (onToolChange) {
        onToolChange(id);
        return;
      }
      if (id === "home") router.push("/tools");
      else router.push(`/#${id}`);
    },
    [onToolChange, router]
  );

  const openRequestTool = useCallback(() => {
    setMobileOpen(false);
    setRequestOpen(true);
  }, []);

  const openSubmitReview = useCallback(() => {
    setMobileOpen(false);
    setReviewOpen(true);
  }, []);

  return (
    <NexusProvider>
      <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-[var(--nx-bg-deep)]">
        <Sidebar
          activeTool={activeTool}
          onToolChange={handleToolChange}
          mobileOpen={mobileOpen}
          onMobileToggle={() => setMobileOpen((open) => !open)}
          onMobileClose={() => setMobileOpen(false)}
          onRequestTool={openRequestTool}
          onSubmitReview={openSubmitReview}
        />

        <main className="flex-1 min-w-0 min-h-0 flex flex-col nx-ambient bg-[var(--nx-bg-base)] relative">
          <div
            className={
              scrollMain
                ? "flex-1 min-h-0 overflow-y-auto scrollbar-visible"
                : "flex-1 min-h-0 overflow-y-auto md:overflow-hidden px-3 sm:px-6 lg:px-8 py-3 sm:py-6 scrollbar-visible"
            }
          >
            {children}
          </div>
          <NexusFooter />
        </main>
      </div>
      <RequestToolModal open={requestOpen} onClose={() => setRequestOpen(false)} />
      <SubmitReviewModal open={reviewOpen} onClose={() => setReviewOpen(false)} />
    </NexusProvider>
  );
}
