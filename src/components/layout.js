import { cn } from "@/lib/utils";

export function Layout({ children, className }) {
  return (
    <div className={cn("min-h-screen bg-background font-sans antialiased", className)}>
      {children}
    </div>
  );
}

export function Container({ children, className }) {
  return (
    <div className={cn("container mx-auto px-4 py-8", className)}>
      {children}
    </div>
  );
}

export function Header({ children, className }) {
  return (
    <header className={cn("mb-8", className)}>
      {children}
    </header>
  );
}

export function Footer({ children, className }) {
  return (
    <footer className={cn("mb-8", className)}>
      {children}
    </footer>
  );
}
