import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  as?: "article" | "div";
}

export default function GlassCard({
  children,
  className,
  as: Component = "article",
}: GlassCardProps) {
  return (
    <Component
      className={cn(
        "relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-200",
        "bg-[var(--glass-bg)] border-[var(--glass-border)]",
        "hover:bg-[var(--bg-card-hover)] hover:-translate-y-0.5",
        className
      )}
    >
      <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-accent/5 blur-3xl" />
      {children}
    </Component>
  );
}
