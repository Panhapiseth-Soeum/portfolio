"use client";

import { useState } from "react";
import { Award, Download, ExternalLink, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SECTION_IDS } from "@/lib/constants";
import { useTheme } from "@/components/layout/ThemeProvider";
import SectionHeading from "@/components/ui/SectionHeading";
import { BentoGrid, BentoCard } from "@/components/ui/BentoGrid";
import SanityImage from "@/components/shared/SanityImage";
import Button from "@/components/ui/Button";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Badge from "@/components/ui/Badge";
import type { Certificate } from "@/types/sanity";

interface CertificatesSectionProps {
  certificates: Certificate[] | null;
}

export default function CertificatesSection({
  certificates,
}: CertificatesSectionProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [selected, setSelected] = useState<Certificate | null>(null);

  if (!certificates || certificates.length === 0) return null;

  return (
    <section id={SECTION_IDS.certificates} className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <SectionHeading title="Certificates" className="mb-16" />
        </ScrollReveal>

        <BentoGrid>
          {certificates.map((cert, i) => (
            <ScrollReveal key={cert._id} delay={i * 0.1}>
              <BentoCard
                colSpan={1}
                className="group cursor-pointer p-0"
              >
                <button
                  className="flex h-full w-full flex-col text-left"
                  onClick={() => setSelected(cert)}
                >
                  {cert.image && (
                    <div className="relative aspect-[1.4/1] w-full overflow-hidden rounded-t-2xl border-b border-[var(--border-color)]">
                      <SanityImage
                        image={cert.image}
                        alt={cert.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                    </div>
                  )}

                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <h3 className="font-display text-sm font-semibold group-hover:text-accent transition-colors line-clamp-2">
                      {cert.title}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      {cert.issuer}
                    </p>
                    {cert.date && (
                      <Badge className="mt-auto w-fit">
                        {new Date(cert.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                        })}
                      </Badge>
                    )}
                  </div>
                </button>
              </BentoCard>
            </ScrollReveal>
          ))}
        </BentoGrid>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`absolute inset-0 ${isDark ? "bg-black/30 backdrop-blur-sm" : "bg-black/10 backdrop-blur-[2px]"}`}
              onClick={() => setSelected(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className={`relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-y-auto rounded-[32px] border shadow-2xl ${isDark ? "backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]" : "bg-white/50 backdrop-blur-sm border-white/40"}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <button
                onClick={() => setSelected(null)}
                className={`absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border text-[var(--text-secondary)] transition-colors hover:border-accent hover:text-accent ${isDark ? "border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-md" : "border-white/40 bg-white/50 backdrop-blur-sm"}`}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              {selected.image && (
                <div className="relative w-full">
                  <SanityImage
                    image={selected.image}
                    alt={selected.title}
                    width={1200}
                    height={800}
                    className="w-full rounded-t-[32px]"
                    priority
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                </div>
              )}

              <div className="flex flex-col gap-4 p-6 sm:p-8">
                <div className="flex items-start gap-3">
                  <Award className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <div>
                    <h2 className="font-display text-xl font-bold">
                      {selected.title}
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {selected.issuer}
                      {selected.date &&
                        ` — ${new Date(selected.date).toLocaleDateString("en-US", { year: "numeric", month: "long" })}`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {selected.fileUrl && (
                    <Button
                      href={selected.fileUrl}
                      download
                      variant="primary"
                    >
                      <Download className="h-4 w-4" />
                      Download PDF
                    </Button>
                  )}
                  {selected.credentialUrl && (
                    <Button
                      href={selected.credentialUrl}
                      variant="secondary"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Verify Credential
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
