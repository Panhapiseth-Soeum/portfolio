"use client";

import { cn } from "@/lib/utils";

interface TechnologyFilterProps {
  technologies: string[];
  activeTech: string | null;
  onChange: (tech: string | null) => void;
  totalCount: number;
  filteredCount: number;
}

export default function TechnologyFilter({
  technologies,
  activeTech,
  onChange,
  totalCount,
  filteredCount,
}: TechnologyFilterProps) {
  if (technologies.length < 2) return null;

  return (
    <div className="mb-10 space-y-3">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => onChange(null)}
          className={cn(
            "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors border",
            activeTech === null
              ? "bg-accent text-white border-accent"
              : "border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          All
        </button>
        {technologies.map((tech) => (
          <button
            key={tech}
            onClick={() => onChange(activeTech === tech ? null : tech)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors border",
              activeTech === tech
                ? "bg-accent text-white border-accent"
                : "border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            {tech}
          </button>
        ))}
      </div>
      <p className="text-xs text-[var(--text-muted)]">
        Showing {filteredCount} of {totalCount} projects
      </p>
    </div>
  );
}
