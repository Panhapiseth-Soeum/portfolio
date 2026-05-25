"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ui/ThemeToggle";
import type { NavItem } from "@/types/sanity";

interface NavigationProps {
  siteTitle: string;
  navItems?: NavItem[];
}

export default function Navigation({ siteTitle, navItems }: NavigationProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = navItems
      ?.map((item) => item.href.replace("#", ""))
      .filter(Boolean);

    if (!sections?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    for (const id of sections) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [navItems]);

  if (pathname.startsWith("/studio")) return null;

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full border-b transition-all duration-300",
        isScrolled
          ? "border-[var(--border-color)] bg-[var(--glass-bg)] backdrop-blur-xl"
          : "border-transparent bg-transparent"
      )}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a
          href="#hero"
          className="font-display text-lg font-semibold tracking-tight hover:text-accent transition-colors"
        >
          {siteTitle}
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {navItems?.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm transition-colors hover:text-accent",
                activeSection === item.href.replace("#", "")
                  ? "text-accent"
                  : "text-[var(--text-secondary)]"
              )}
            >
              {item.label}
            </a>
          ))}
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-color)]"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-[var(--border-color)] bg-[var(--glass-bg)] backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1 px-6 py-4">
            {navItems?.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-lg px-4 py-3 text-sm transition-colors hover:bg-[var(--bg-card-hover)]",
                  activeSection === item.href.replace("#", "")
                    ? "text-accent"
                    : "text-[var(--text-secondary)]"
                )}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
