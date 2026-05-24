import type { PortableTextBlock } from "@portabletext/react";

export interface SiteSettings {
  _id: string;
  title: string;
  description?: string;
  favicon?: SanityImage;
  socialLinks?: SocialLink[];
  navItems?: NavItem[];
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
  order: number;
}

export interface NavItem {
  label: string;
  href: string;
  order: number;
}

export interface Hero {
  _id: string;
  name: string;
  role: string;
  tagline?: string;
  ctaPrimary?: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
}

export interface About {
  _id: string;
  headline?: string;
  bio?: PortableTextBlock[];
  profilePhoto?: SanityImage;
  resumeUrl?: string;
}

export interface Project {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  coverImage?: SanityImage;
  screenshots?: SanityImage[];
  technologies?: string[];
  liveUrl?: string;
  sourceUrl?: string;
  featured: boolean;
  order: number;
  problem?: PortableTextBlock[];
  solution?: PortableTextBlock[];
  result?: PortableTextBlock[];
}

export interface Skill {
  _id: string;
  name: string;
  category: SkillCategory;
  icon?: string;
  order: number;
}

export type SkillCategory =
  | "languages"
  | "frameworks"
  | "tools"
  | "databases"
  | "design"
  | "other";

export interface SanityImage {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
  alt?: string;
}
