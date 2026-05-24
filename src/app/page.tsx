import { sanityFetch } from "@/sanity/fetch";
import {
  siteSettingsQuery,
  heroQuery,
  aboutQuery,
  projectsQuery,
  skillsQuery,
} from "@/sanity/queries";
import type { SiteSettings, Hero, About, Project, Skill } from "@/types/sanity";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import SkillsSection from "@/components/sections/SkillsSection";
import ContactSection from "@/components/sections/ContactSection";

async function getData() {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID === "placeholder") {
    return {
      siteSettings: null,
      hero: null,
      about: null,
      projects: null,
      skills: null,
    };
  }
  try {
    const [siteSettings, hero, about, projects, skills] = await Promise.all([
      sanityFetch<SiteSettings | null>({
        query: siteSettingsQuery,
        tags: ["siteSettings"],
      }),
      sanityFetch<Hero | null>({ query: heroQuery, tags: ["hero"] }),
      sanityFetch<About | null>({ query: aboutQuery, tags: ["about"] }),
      sanityFetch<Project[] | null>({
        query: projectsQuery,
        tags: ["project"],
      }),
      sanityFetch<Skill[] | null>({ query: skillsQuery, tags: ["skill"] }),
    ]);
    return { siteSettings, hero, about, projects, skills };
  } catch {
    return {
      siteSettings: null,
      hero: null,
      about: null,
      projects: null,
      skills: null,
    };
  }
}

export default async function HomePage() {
  const { siteSettings, hero, about, projects, skills } = await getData();

  return (
    <>
      <HeroSection hero={hero} />
      <AboutSection about={about} />
      <ProjectsSection projects={projects} />
      <SkillsSection skills={skills} />
      <ContactSection socialLinks={siteSettings?.socialLinks} />
    </>
  );
}
