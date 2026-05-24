"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, FolderGit } from "lucide-react";
import SanityImage from "@/components/shared/SanityImage";
import PortableTextRenderer from "@/components/shared/PortableTextRenderer";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import type { Project } from "@/types/sanity";

function getEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    // YouTube
    if (parsed.hostname.includes("youtube.com") || parsed.hostname.includes("youtu.be")) {
      const videoId = parsed.hostname.includes("youtu.be")
        ? parsed.pathname.slice(1)
        : parsed.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    // Vimeo
    if (parsed.hostname.includes("vimeo.com")) {
      const videoId = parsed.pathname.split("/").pop();
      if (videoId && /^\d+$/.test(videoId)) return `https://player.vimeo.com/video/${videoId}`;
    }
    // Loom
    if (parsed.hostname.includes("loom.com")) {
      const parts = parsed.pathname.split("/");
      const shareId = parts[parts.length - 1] || parts[parts.length - 2];
      if (shareId) return `https://www.loom.com/embed/${shareId}`;
    }
  } catch {}
  return null;
}

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectDetailModal({
  project,
  onClose,
}: ProjectDetailModalProps) {
  useEffect(() => {
    if (!project) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-y-auto rounded-2xl border bg-[var(--bg-secondary)] border-[var(--border-color)] shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors hover:text-accent"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>

            {project.videoUrl && getEmbedUrl(project.videoUrl) ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl bg-black">
                <iframe
                  src={getEmbedUrl(project.videoUrl)!}
                  title={`${project.title} demo video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            ) : project.coverImage ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl">
                <SanityImage
                  image={project.coverImage}
                  alt={project.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
            ) : null}

            <div className="flex flex-col gap-6 p-6 sm:p-8">
              <div>
                <h2 className="font-display text-2xl font-bold">
                  {project.title}
                </h2>
                {project.description && (
                  <p className="mt-2 text-[var(--text-secondary)]">
                    {project.description}
                  </p>
                )}
              </div>

              {project.technologies && project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <Badge key={tech}>{tech}</Badge>
                  ))}
                </div>
              )}

              {project.problem && (
                <div>
                  <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wider text-accent">
                    The Problem
                  </h3>
                  <PortableTextRenderer value={project.problem} />
                </div>
              )}

              {project.solution && (
                <div>
                  <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wider text-accent">
                    The Solution
                  </h3>
                  <PortableTextRenderer value={project.solution} />
                </div>
              )}

              {project.result && (
                <div>
                  <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wider text-accent">
                    The Result
                  </h3>
                  <PortableTextRenderer value={project.result} />
                </div>
              )}

              {project.screenshots && project.screenshots.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {project.screenshots.map((shot, i) => (
                    <div
                      key={i}
                      className="relative aspect-video overflow-hidden rounded-xl border border-[var(--border-color)]"
                    >
                      <SanityImage
                        image={shot}
                        alt={`${project.title} screenshot ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 380px"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                {project.liveUrl && (
                  <Button href={project.liveUrl}>
                    <ExternalLink className="h-4 w-4" />
                    Live Demo
                  </Button>
                )}
                {project.sourceUrl && (
                  <Button href={project.sourceUrl} variant="secondary">
                    <FolderGit className="h-4 w-4" />
                    Source Code
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
