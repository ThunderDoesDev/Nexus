import Link from "next/link";
import Logo from "@/components/Logo";
import Seo from "@/components/Seo";
import { PAGE_SEO } from "@/lib/seo";

export default function Custom404() {
  const seo = PAGE_SEO.notFound;
  return (
    <div className="flex flex-col items-center justify-center min-h-screen nx-ambient bg-[var(--nx-bg-deep)] text-center p-8 relative overflow-hidden">
      <Seo title={seo.title} description={seo.description} path={seo.path} noIndex />
      <div className="absolute inset-0 nx-mesh pointer-events-none" />
      <div className="relative">
        <Logo className="h-16 w-auto mb-8 mx-auto" />
        <h1 className="nx-display text-8xl font-extrabold nx-gradient-accent mb-2">404</h1>
        <h2 className="text-xl font-bold text-[var(--nx-text-heading)] mb-3">Page not found</h2>
        <p className="text-[var(--nx-text-muted)] mb-8 max-w-md leading-relaxed mx-auto">
          This page doesn&apos;t exist. Head back to the toolkit.
        </p>
        <Link
          href="/"
          className="inline-flex items-center h-11 px-6 rounded-xl bg-[var(--nx-accent)] hover:bg-[var(--nx-accent-hover)] text-white font-semibold transition-all"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
