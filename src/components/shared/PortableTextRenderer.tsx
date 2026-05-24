import {
  PortableText,
  type PortableTextComponents,
} from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/react";
import { cn } from "@/lib/utils";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-[var(--text-secondary)] leading-relaxed">{children}</p>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-[var(--text-primary)]">
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em className="italic text-accent">{children}</em>
    ),
    code: ({ children }) => (
      <code className="rounded bg-[var(--bg-card)] px-1.5 py-0.5 text-sm font-mono text-accent">
        {children}
      </code>
    ),
    link: ({ children, value }) => (
      <a
        href={value.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent underline underline-offset-2 hover:text-accent-hover transition-colors"
      >
        {children}
      </a>
    ),
  },
};

interface PortableTextRendererProps {
  value: PortableTextBlock[];
  className?: string;
}

export default function PortableTextRenderer({
  value,
  className,
}: PortableTextRendererProps) {
  return (
    <div className={cn("prose-custom space-y-4", className)}>
      <PortableText value={value} components={components} />
    </div>
  );
}
