import { FolderGit, BriefcaseBusiness, Mail } from "lucide-react";
import { SECTION_IDS } from "@/lib/constants";
import SectionHeading from "@/components/ui/SectionHeading";
import GlassCard from "@/components/ui/GlassCard";
import ScrollReveal from "@/components/ui/ScrollReveal";
import StaggerChildren, { StaggerItem } from "@/components/ui/StaggerChildren";
import type { SocialLink } from "@/types/sanity";

interface ContactSectionProps {
  socialLinks?: SocialLink[];
}

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Github: FolderGit,
  Linkedin: BriefcaseBusiness,
  Mail,
};

const platformColors: Record<string, string> = {
  Github: "hover:text-[#fafafa] hover:border-[#333]",
  Linkedin: "hover:text-[#0A66C2] hover:border-[#0A66C2]",
  Mail: "hover:text-accent hover:border-accent",
};

export default function ContactSection({ socialLinks }: ContactSectionProps) {
  if (!socialLinks || socialLinks.length === 0) return null;

  return (
    <section id={SECTION_IDS.contact} className="py-24 px-6">
      <div className="mx-auto max-w-3xl">
        <ScrollReveal>
          <SectionHeading
            title="Get in Touch"
            subtitle="I&rsquo;m always open to new opportunities and collaborations."
            className="mb-16"
          />
        </ScrollReveal>

        <StaggerChildren className="flex flex-wrap justify-center gap-4">
          {socialLinks.map((link) => {
            const Icon = platformIcons[link.icon] || Mail;
            return (
              <StaggerItem key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <GlassCard
                    className={`flex items-center gap-4 px-8 py-5 ${platformColors[link.icon] || "hover:text-accent hover:border-accent"}`}
                    as="div"
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="font-medium text-sm">{link.platform}</span>
                  </GlassCard>
                </a>
              </StaggerItem>
            );
          })}
        </StaggerChildren>
      </div>
    </section>
  );
}
