import React from "react";
import { cn } from "@/lib/utils";

export default function NexusHeader({ className }) {
	return (
        <header className={cn("w-full max-w-7xl mx-auto px-2 pt-6 pb-0 mb-0 sm:px-4 sm:pt-8", className)}>
      <div className="text-center space-y-3 py-0 mt-0" style={{marginTop: 0, paddingTop: 0}}>
        <div className="inline-block">
          <h1
  style={{
    fontSize: 'clamp(2.2rem, 7vw, 3.5rem)',
    fontWeight: 800,
    lineHeight: 1.1,
    textAlign: 'center',
    background: 'linear-gradient(90deg, #6ee7b7 0%, #3b82f6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '0.5rem',
    marginTop: '1.5rem',
  }}
>
  Nexus<br />Permissions<br />Calculator
</h1>
<p
  style={{
    fontSize: 'clamp(1rem, 3vw, 1.25rem)',
    textAlign: 'center',
    color: '#e0e7ef',
    marginBottom: '1.5rem',
    marginTop: '0.5rem',
    fontWeight: 500,
    letterSpacing: '0.01em',
  }}
>
  Instantly generate Discord bot permissions and invite links.
</p>
        </div>
      </div>
    </header>
	);
}
