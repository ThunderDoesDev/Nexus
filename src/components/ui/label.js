import * as React from "react";
import { cn } from "@/lib/utils";

const Label = React.forwardRef(({ className = "", children, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "block text-xs sm:text-sm font-semibold px-2 py-2 rounded bg-slate-800 text-white dark:bg-slate-900 dark:text-white mb-0 w-full",
      className
    )}
    style={{ fontSize: "clamp(13px, 4vw, 16px)" }}
    {...props}
  >
    <span className="flex flex-col gap-1">{children}</span>
  </label>
));
Label.displayName = "Label";

const NormalLabel = React.forwardRef(({ className = "", children, ...props }, ref) => (
  <label
    ref={ref}
    className={cn("text-xs sm:text-sm w-full", className)}
    style={{ fontSize: "clamp(13px, 4vw, 16px)" }}
    {...props}
  >
    {children}
  </label>
));
NormalLabel.displayName = "NormalLabel";

export { Label, NormalLabel };
