import { ArrowDown } from "lucide-react";
import { SECTION_IDS } from "@/lib/constants";
import Button from "@/components/ui/Button";
import ScrollReveal from "@/components/ui/ScrollReveal";
import type { Hero } from "@/types/sanity";

interface HeroSectionProps {
  hero: Hero | null;
}

export default function HeroSection({ hero }: HeroSectionProps) {
  if (!hero) return null;

  return (
    <section
      id={SECTION_IDS.hero}
      className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08),transparent_70%)]" />

      <div className="relative z-10 flex max-w-3xl flex-col items-center gap-6">
        <ScrollReveal delay={0.1}>
          <p className="font-display text-lg text-accent">Hi, I&rsquo;m</p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <h1 className="font-display text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            {hero.name}
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <p className="font-display text-2xl text-[var(--text-secondary)] sm:text-3xl">
            {hero.role}
          </p>
        </ScrollReveal>

        {hero.tagline && (
          <ScrollReveal delay={0.4}>
            <p className="max-w-xl text-lg text-[var(--text-muted)]">
              {hero.tagline}
            </p>
          </ScrollReveal>
        )}

        <ScrollReveal delay={0.5}>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {hero.ctaPrimary && (
              <Button href={hero.ctaPrimary.href} size="lg">
                {hero.ctaPrimary.label}
              </Button>
            )}
            {hero.ctaSecondary && (
              <Button
                href={hero.ctaSecondary.href}
                variant="secondary"
                size="lg"
              >
                {hero.ctaSecondary.label}
              </Button>
            )}
          </div>
        </ScrollReveal>
      </div>

      <ScrollReveal delay={0.8} className="absolute bottom-8">
        <a
          href={`#${SECTION_IDS.about}`}
          className="flex animate-bounce flex-col items-center gap-2 text-xs text-[var(--text-muted)] transition-colors hover:text-accent"
          aria-label="Scroll to about section"
        >
          <span className="uppercase tracking-widest">Scroll</span>
          <ArrowDown className="h-4 w-4" />
        </a>
      </ScrollReveal>
    </section>
  );
}
