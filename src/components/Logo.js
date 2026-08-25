import { cn } from "@/lib/utils";

export default function Logo({ className, ...props }) {
  return (
    <img
      src="/logo.png"
      alt="Nexus"
      className={cn("object-contain select-none", className)}
      {...props}
    />
  );
}
