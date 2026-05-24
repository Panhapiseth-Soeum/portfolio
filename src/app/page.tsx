import { sanityFetch } from "@/sanity/fetch";
import {
  siteSettingsQuery,
  heroQuery,
  aboutQuery,
  projectsQuery,
  skillsQuery,
  certificatesQuery,
} from "@/sanity/queries";
import type { SiteSettings, Hero, About, Project, Skill, Certificate } from "@/types/sanity";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import SkillsSection from "@/components/sections/SkillsSection";
import CertificatesSection from "@/components/sections/CertificatesSection";
import ContactSection from "@/components/sections/ContactSection";

async function getData() {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID === "placeholder") {
    return {
      siteSettings: null,
      hero: null,
      about: null,
      projects: null,
      skills: null,
      certificates: null,
    };
  }
  try {
    const [siteSettings, hero, about, projects, skills, certificates] = await Promise.all([
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
      sanityFetch<Certificate[] | null>({ query: certificatesQuery, tags: ["certificate"] }),
    ]);
    return { siteSettings, hero, about, projects, skills, certificates };
  } catch {
    return {
      siteSettings: null,
      hero: null,
      about: null,
      projects: null,
      skills: null,
      certificates: null,
    };
  }
}

export default async function HomePage() {
  const { siteSettings, hero, about, projects, skills, certificates } = await getData();

  return (
    <>
      <HeroSection hero={hero} />
      <AboutSection about={about} />
      <ProjectsSection projects={projects} />
      <SkillsSection skills={skills} />
      <CertificatesSection certificates={certificates} />
      <ContactSection socialLinks={siteSettings?.socialLinks} />
    </>
  );
}
