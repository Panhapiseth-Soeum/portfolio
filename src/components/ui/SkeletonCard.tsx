import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  count?: number;
  className?: string;
}

function SkeletonItem({ colSpan = 1 }: { colSpan?: 1 | 2 }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)]",
        colSpan === 2 && "lg:col-span-2"
      )}
    >
      <div className="aspect-video w-full rounded-t-2xl bg-[var(--bg-card)]" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-2/3 rounded-full bg-[var(--bg-card)]" />
        <div className="h-3 w-full rounded-full bg-[var(--bg-card)]" />
        <div className="h-3 w-4/5 rounded-full bg-[var(--bg-card)]" />
        <div className="flex gap-2 pt-2">
          <div className="h-6 w-16 rounded-full bg-[var(--bg-card)]" />
          <div className="h-6 w-20 rounded-full bg-[var(--bg-card)]" />
          <div className="h-6 w-14 rounded-full bg-[var(--bg-card)]" />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
}

export default function SkeletonCard({
  count = 6,
  className,
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonItem
          key={i}
          colSpan={i % 3 === 0 ? 2 : 1}
        />
      ))}
    </div>
  );
}
