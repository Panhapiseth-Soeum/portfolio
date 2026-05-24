import type { SocialLink } from "@/types/sanity";
import { FolderGit, BriefcaseBusiness, Mail, ArrowUp } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Github: FolderGit,
  Linkedin: BriefcaseBusiness,
  Mail,
};

interface FooterProps {
  siteTitle: string;
  socialLinks?: SocialLink[];
}

export default function Footer({ siteTitle, socialLinks }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border-color)]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-12 sm:flex-row sm:justify-between">
        <p className="text-sm text-[var(--text-muted)]">
          &copy; {year} {siteTitle}. Built with Next.js &amp; Sanity.
        </p>

        <div className="flex items-center gap-4">
          {socialLinks?.map((link) => {
            const Icon = iconMap[link.icon] || Mail;
            return (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--text-secondary)] transition-colors hover:text-accent"
                aria-label={link.platform}
              >
                <Icon className="h-5 w-5" />
              </a>
            );
          })}
          <a
            href="#hero"
            className="ml-2 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] transition-colors hover:text-accent hover:border-accent"
            aria-label="Back to top"
          >
            <ArrowUp className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
