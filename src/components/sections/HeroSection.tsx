"use client";

import { ArrowDown } from "lucide-react";
import { SECTION_IDS } from "@/lib/constants";
import Button from "@/components/ui/Button";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { LazyUniverseScene, LazyLightScene } from "@/components/three/LazyScene";
import { useTheme } from "@/components/layout/ThemeProvider";
import type { Hero } from "@/types/sanity";

interface HeroSectionProps {
  hero: Hero | null;
}

export default function HeroSection({ hero }: HeroSectionProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  if (!hero) return null;

  return (
    <section
      id={SECTION_IDS.hero}
      className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center select-none"
    >
      <div className="absolute inset-0 z-0">
        {isDark ? <LazyUniverseScene /> : <LazyLightScene />}
      </div>

      {isDark && (
        <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.4),transparent_50%)]" />
      )}

      <div className="relative z-10 flex max-w-3xl flex-col items-center gap-6">
        <ScrollReveal delay={0.1}>
          <p
            className={
              isDark
                ? "font-display text-lg text-accent [text-shadow:0_0_20px_rgba(0,0,0,0.5)]"
                : "font-display text-lg text-accent"
            }
          >
            Hi, I&rsquo;m
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <h1
            className={
              isDark
                ? "font-display text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl [text-shadow:0_0_40px_rgba(0,0,0,0.8)]"
                : "font-display text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
            }
          >
            {hero.name}
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <p
            className={
              isDark
                ? "font-display text-2xl text-[var(--text-secondary)] sm:text-3xl [text-shadow:0_0_30px_rgba(0,0,0,0.7)]"
                : "font-display text-2xl text-[var(--text-secondary)] sm:text-3xl"
            }
          >
            {hero.role}
          </p>
        </ScrollReveal>

        {hero.tagline && (
          <ScrollReveal delay={0.4}>
            <p
              className={
                isDark
                  ? "max-w-xl text-lg text-[var(--text-muted)] [text-shadow:0_0_24px_rgba(0,0,0,0.6)]"
                  : "max-w-xl text-lg text-[var(--text-muted)]"
              }
            >
              {hero.tagline}
            </p>
          </ScrollReveal>
        )}

        <ScrollReveal delay={0.5}>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {hero.ctaPrimary && (
              <span className={isDark ? "backdrop-blur-sm bg-black/20 rounded-full" : ""}>
                <Button href={hero.ctaPrimary.href} size="lg">
                  {hero.ctaPrimary.label}
                </Button>
              </span>
            )}
            {hero.ctaSecondary && (
              <span className={isDark ? "backdrop-blur-sm bg-black/20 rounded-full" : ""}>
                <Button
                  href={hero.ctaSecondary.href}
                  variant="secondary"
                  size="lg"
                >
                  {hero.ctaSecondary.label}
                </Button>
              </span>
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
