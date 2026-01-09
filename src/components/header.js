import React from "react";
import { cn } from "@/lib/utils";

export default function NexusHeader({ className }) {
	return (
        <header className={cn("w-full max-w-7xl mx-auto px-4 pt-8 pb-0 mb-0", className)}>
		<div className="text-center space-y-4 py-0 mt-0" style={{marginTop: 0, paddingTop: 0}}>
        <div className="inline-block">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
            Nexus Permissions Calculator
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Instantly generate Discord bot permissions and invite links.
        </p>
      </div>
    </header>
	);
}
