import * as React from "react";
import { cn } from "@/lib/utils";

const VARIANT_STYLES = {
  default: "bg-slate-700 text-white hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-700 focus-visible:ring-slate-500",
  destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
  outline: "border-2 border-slate-300 dark:border-slate-600 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300",
  secondary: "bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600",
  ghost: "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300",
  link: "text-slate-700 dark:text-slate-300 underline-offset-4 hover:underline",
};

const SIZE_STYLES = {
  default: "h-10 px-4 py-2 text-base sm:text-sm",
  sm: "h-9 rounded-md px-3 text-xs",
  lg: "h-12 rounded-lg px-6 text-lg sm:text-base",
  mobile: "h-10 px-2 py-2 text-base w-full",
};

const Button = React.forwardRef(
  (
    {
      className = "",
      variant = "default",
      size = typeof window !== "undefined" && window.innerWidth < 600 ? "mobile" : "default",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-sm hover:shadow-md active:scale-95",
          VARIANT_STYLES[variant],
          SIZE_STYLES[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";


export { Button };
