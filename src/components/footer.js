import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export default function NexusFooter({ className }) {
  return (
    <div className="w-full max-w-7xl mx-auto p-2 md:p-4 lg:p-8">
      <Card className={cn("p-6 md:p-8 shadow-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700", className)}>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mt-2 pt-2 border-t border-slate-700">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-base font-semibold text-slate-700 dark:text-slate-200">Nexus Permissions Calculator</span>
            <span className="text-xs text-slate-400">© {new Date().getFullYear()} Nexus. All rights reserved.</span>
              <span className="text-xs text-slate-400">Not affiliated with Discord Inc.</span>
          </div>
          <div className="flex flex-col items-center md:items-end gap-1">
            <span className="flex items-center gap-2 text-sm text-slate-400">
              Created by ThunderDoesDev
              <span aria-label="love" title="love" className="text-red-500 text-lg">♥</span>
            </span>
            <span className="flex items-center gap-2 mt-1">
              <a href="https://github.com/ThunderDoesDev/nexus" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="ml-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                  <path d="M12 2C6.477 2 2 6.484 2 12.012c0 4.418 2.867 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.089 2.91.833.091-.646.35-1.089.636-1.341-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.579.688.481C19.135 20.175 22 16.427 22 12.012 22 6.484 17.523 2 12 2z"/>
                </svg>
              </a>
              <a href="https://thunderdoesdev.gg" target="_blank" rel="noopener noreferrer" aria-label="Website" className="ml-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 0 20" />
                  <path d="M12 2a15.3 15.3 0 0 0 0 20" />
                </svg>
              </a>
              <a href="https://discord.gg/thunderdoesdev" target="_blank" rel="noopener noreferrer" aria-label="Discord" className="ml-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
                >
                  <path
                    d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02M8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12m6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12"
                  />
                </svg>
              </a>
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
