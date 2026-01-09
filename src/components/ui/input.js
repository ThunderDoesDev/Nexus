
import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(
  ({ className = "", type = "text", children, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-base sm:text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm hover:shadow-md",
          className
        )}
        style={{ fontSize: "clamp(15px, 4vw, 18px)" }}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
