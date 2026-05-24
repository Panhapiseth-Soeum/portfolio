import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        "border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)]",
        "hover:border-accent/30 hover:text-accent",
        className
      )}
    >
      {children}
    </span>
  );
}
