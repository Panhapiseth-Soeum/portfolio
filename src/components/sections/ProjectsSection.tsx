"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";
import { SECTION_IDS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import SectionHeading from "@/components/ui/SectionHeading";
import { BentoGrid } from "@/components/ui/BentoGrid";
import GlassCard from "@/components/ui/GlassCard";
import SkeletonCard from "@/components/ui/SkeletonCard";
import TechnologyFilter from "@/components/ui/TechnologyFilter";
import ProjectDetailModal from "@/components/ui/ProjectDetailModal";
import SanityImage from "@/components/shared/SanityImage";
import Badge from "@/components/ui/Badge";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useTilt } from "@/hooks/useTilt";
import type { Project } from "@/types/sanity";

interface ProjectsSectionProps {
  projects: Project[] | null;
  isLoading?: boolean;
}

function ProjectCard({
  project,
  index,
  onClick,
}: {
  project: Project;
  index: number;
  onClick: () => void;
}) {
  const { tilt, onMouseMove, onMouseLeave, prefersReducedMotion } = useTilt();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.3,
        delay: prefersReducedMotion ? 0 : Math.min(index * 0.05, 0.3),
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={cn(project.featured ? "lg:col-span-2" : "lg:col-span-1")}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={
        prefersReducedMotion
          ? undefined
          : {
              perspective: "1000px",
              transformStyle: "preserve-3d" as const,
              rotateX: tilt.rotateX,
              rotateY: tilt.rotateY,
            }
      }
    >
      <GlassCard className="group cursor-pointer p-0">
        <button
          className="flex h-full w-full flex-col text-left"
          onClick={onClick}
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
      </GlassCard>

      {!prefersReducedMotion && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.08) 0%, transparent 60%)`,
          }}
        />
      )}
    </motion.div>
  );
}

export default function ProjectsSection({
  projects,
  isLoading = false,
}: ProjectsSectionProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTech, setActiveTech] = useState<string | null>(null);

  const allTechnologies = useMemo(() => {
    if (!projects) return [];
    const techSet = new Set<string>();
    projects.forEach((p) =>
      p.technologies?.forEach((t) => techSet.add(t))
    );
    return Array.from(techSet).sort((a, b) => a.localeCompare(b));
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    if (!activeTech) return projects;
    return projects.filter((p) => p.technologies?.includes(activeTech));
  }, [projects, activeTech]);

  if (isLoading) {
    return (
      <section id={SECTION_IDS.projects} className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <ScrollReveal>
            <SectionHeading title="Projects" className="mb-16" />
          </ScrollReveal>
          <SkeletonCard count={6} />
        </div>
      </section>
    );
  }

  if (!projects || projects.length === 0) return null;

  return (
    <section id={SECTION_IDS.projects} className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <SectionHeading title="Projects" className="mb-10" />
        </ScrollReveal>

        <TechnologyFilter
          technologies={allTechnologies}
          activeTech={activeTech}
          onChange={setActiveTech}
          totalCount={projects.length}
          filteredCount={filteredProjects.length}
        />

        <BentoGrid>
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, i) => (
              <ProjectCard
                key={project._id}
                project={project}
                index={i}
                onClick={() => setSelectedProject(project)}
              />
            ))}
          </AnimatePresence>
        </BentoGrid>
      </div>

      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
}
