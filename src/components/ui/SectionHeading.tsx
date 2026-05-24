import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export default function SectionHeading({
  title,
  subtitle,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3 text-center", className)}>
      <div className="flex items-center gap-4">
        <span className="h-px w-8 bg-accent/40" />
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
          {title}
        </span>
        <span className="h-px w-8 bg-accent/40" />
      </div>
      {subtitle && (
        <p className="max-w-lg text-[var(--text-secondary)]">{subtitle}</p>
      )}
    </div>
  );
}
