import { SECTION_IDS } from "@/lib/constants";
import SectionHeading from "@/components/ui/SectionHeading";
import { BentoGrid, BentoCard } from "@/components/ui/BentoGrid";
import Badge from "@/components/ui/Badge";
import ScrollReveal from "@/components/ui/ScrollReveal";
import StaggerChildren, { StaggerItem } from "@/components/ui/StaggerChildren";
import * as LucideIcons from "lucide-react";
import type { Skill, SkillCategory } from "@/types/sanity";

interface SkillsSectionProps {
  skills: Skill[] | null;
}

const categoryLabels: Record<SkillCategory, string> = {
  languages: "Languages",
  frameworks: "Frameworks",
  tools: "Tools & Platforms",
  databases: "Databases",
  design: "Design",
  other: "Other",
};

const categoryIcons: Record<SkillCategory, string> = {
  languages: "Code2",
  frameworks: "Layers",
  tools: "Wrench",
  databases: "Database",
  design: "Palette",
  other: "Zap",
};

function getIcon(iconName?: string) {
  if (!iconName) return null;
  const icons = LucideIcons as unknown as Record<
    string,
    React.ComponentType<{ className?: string }>
  >;
  const Icon = icons[iconName];
  return Icon ? <Icon className="h-4 w-4" /> : null;
}

export default function SkillsSection({ skills }: SkillsSectionProps) {
  if (!skills || skills.length === 0) return null;

  const grouped = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const cat = skill.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  const categories = Object.keys(grouped) as SkillCategory[];

  return (
    <section id={SECTION_IDS.skills} className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <SectionHeading title="Skills" className="mb-16" />
        </ScrollReveal>

        <StaggerChildren>
          <BentoGrid>
            {categories.map((category) => {
              const catSkills = grouped[category];
              const CatIcon = (
                LucideIcons as unknown as Record<
                  string,
                  React.ComponentType<{ className?: string }>
                >
              )[categoryIcons[category]];

              return (
                <StaggerItem key={category}>
                  <BentoCard
                    colSpan={catSkills.length > 5 ? 2 : 1}
                    className="flex flex-col gap-4 p-6"
                  >
                    <div className="flex items-center gap-2 text-accent">
                      {CatIcon && <CatIcon className="h-4 w-4" />}
                      <h3 className="font-display text-sm font-semibold uppercase tracking-wider">
                        {categoryLabels[category]}
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {catSkills.map((skill) => (
                        <Badge key={skill._id}>
                          {getIcon(skill.icon)}
                          {skill.icon && <span className="w-1" />}
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </BentoCard>
                </StaggerItem>
              );
            })}
          </BentoGrid>
        </StaggerChildren>
      </div>
    </section>
  );
}
