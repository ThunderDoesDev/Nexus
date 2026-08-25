import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef(({ className = "", children, ...props }, ref) => (
  <div ref={ref} className={cn("nx-card text-[var(--nx-text)]", className)} {...props}>
    {children}
  </div>
));
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className = "", children, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-1.5 p-5 pb-0", className)} {...props}>
    {children}
  </div>
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className = "", children, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-lg font-semibold text-[var(--nx-text-heading)]", className)} {...props}>
    {children}
  </h3>
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className = "", children, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-[var(--nx-text-muted)]", className)} {...props}>
    {children}
  </p>
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className = "", children, ...props }, ref) => (
  <div ref={ref} className={cn("p-5", className)} {...props}>
    {children}
  </div>
));
CardContent.displayName = "CardContent";

export { Card, CardHeader, CardTitle, CardDescription, CardContent };
