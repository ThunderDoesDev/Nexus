import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export default function NexusFooter({ className }) {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-4 lg:p-8">
      <Card className={cn("p-6 md:p-8 shadow-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700", className)}>
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-700">
          <span className="text-xs text-slate-400">
            © {new Date().getFullYear()} Nexus
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            Created by <a href="https://thunderdoesdev.gg" target="_blank" rel="noopener noreferrer" className="underline text-blue-400">ThunderDoesDev</a>
            <span aria-label="love" title="love" className="text-red-500">♥</span>
          </span>
        </div>
      </Card>
    </div>
  );
}
