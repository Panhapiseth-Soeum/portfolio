"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { SECTION_IDS } from "@/lib/constants";
import SectionHeading from "@/components/ui/SectionHeading";
import { BentoGrid, BentoCard } from "@/components/ui/BentoGrid";
import SanityImage from "@/components/shared/SanityImage";
import Badge from "@/components/ui/Badge";
import ScrollReveal from "@/components/ui/ScrollReveal";
import ProjectDetailModal from "@/components/ui/ProjectDetailModal";
import type { Project } from "@/types/sanity";

interface ProjectsSectionProps {
  projects: Project[] | null;
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  if (!projects || projects.length === 0) return null;

  return (
    <section id={SECTION_IDS.projects} className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <SectionHeading title="Projects" className="mb-16" />
        </ScrollReveal>

        <BentoGrid>
          {projects.map((project, i) => (
            <ScrollReveal key={project._id} delay={i * 0.1}>
              <BentoCard
                colSpan={project.featured ? 2 : 1}
                className="group cursor-pointer p-0"
              >
                <button
                  className="flex h-full w-full flex-col text-left"
                  onClick={() => setSelectedProject(project)}
                >
                  {project.coverImage && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl">
                      <SanityImage
                        image={project.coverImage}
                        alt={project.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                      {project.videoUrl && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/90 text-white shadow-lg transition-transform group-hover:scale-110">
                            <Play className="ml-0.5 h-5 w-5" />
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <h3 className="font-display text-lg font-semibold group-hover:text-accent transition-colors">
                      {project.title}
                    </h3>

                    {project.description && (
                      <p className="line-clamp-2 text-sm text-[var(--text-secondary)]">
                        {project.description}
                      </p>
                    )}

                    {project.technologies && project.technologies.length > 0 && (
                      <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                        {project.technologies.slice(0, 4).map((tech) => (
                          <Badge key={tech}>{tech}</Badge>
                        ))}
                        {project.technologies.length > 4 && (
                          <Badge>+{project.technologies.length - 4}</Badge>
                        )}
                      </div>
                    )}

                    <p className="mt-2 text-xs text-accent opacity-0 transition-opacity group-hover:opacity-100">
                      Click to view details &rarr;
                    </p>
                  </div>
                </button>
              </BentoCard>
            </ScrollReveal>
          ))}
        </BentoGrid>
      </div>

      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
}
