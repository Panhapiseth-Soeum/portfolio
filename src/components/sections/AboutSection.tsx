import { Download } from "lucide-react";
import { SECTION_IDS } from "@/lib/constants";
import SectionHeading from "@/components/ui/SectionHeading";
import SanityImage from "@/components/shared/SanityImage";
import PortableTextRenderer from "@/components/shared/PortableTextRenderer";
import Button from "@/components/ui/Button";
import ScrollReveal from "@/components/ui/ScrollReveal";
import type { About } from "@/types/sanity";

interface AboutSectionProps {
  about: About | null;
}

export default function AboutSection({ about }: AboutSectionProps) {
  if (!about) return null;

  const hasContent = about.bio || about.profilePhoto || about.resumeUrl;
  if (!hasContent) return null;

  return (
    <section id={SECTION_IDS.about} className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <SectionHeading
            title="About"
            subtitle={about.headline || undefined}
            className="mb-16"
          />
        </ScrollReveal>

        <div className="flex flex-col items-center gap-12 md:flex-row md:items-start">
          {about.profilePhoto && (
            <ScrollReveal direction="left" className="shrink-0">
              <div className="relative h-56 w-56 overflow-hidden rounded-2xl border border-[var(--border-color)] sm:h-64 sm:w-64">
                <SanityImage
                  image={about.profilePhoto}
                  alt="Profile photo"
                  fill
                  sizes="256px"
                />
              </div>
            </ScrollReveal>
          )}

          <ScrollReveal direction="right" className="flex flex-col gap-6">
            {about.bio && <PortableTextRenderer value={about.bio} />}

            {about.resumeUrl && (
              <Button href={about.resumeUrl} download variant="secondary">
                <Download className="h-4 w-4" />
                Download Resume
              </Button>
            )}
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
