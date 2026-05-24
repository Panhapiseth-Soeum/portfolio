export const siteSettingsQuery = `*[_type == "siteSettings"][0]{
  _id,
  title,
  description,
  favicon,
  socialLinks[] | order(order asc) {
    platform, url, icon, order
  },
  navItems[] | order(order asc) {
    label, href, order
  }
}`;

export const heroQuery = `*[_type == "hero"][0]{
  _id,
  name,
  role,
  tagline,
  ctaPrimary,
  ctaSecondary
}`;

export const aboutQuery = `*[_type == "about"][0]{
  _id,
  headline,
  bio,
  profilePhoto,
  "resumeUrl": resume.asset->url
}`;

export const projectsQuery = `*[_type == "project"] | order(order asc) {
  _id,
  title,
  slug,
  description,
  coverImage,
  screenshots,
  technologies,
  liveUrl,
  sourceUrl,
  featured,
  order,
  problem,
  solution,
  result
}`;

export const skillsQuery = `*[_type == "skill"] | order(order asc) {
  _id,
  name,
  category,
  icon,
  order
}`;

export const certificatesQuery = `*[_type == "certificate"] | order(order asc) {
  _id,
  title,
  issuer,
  date,
  image,
  "fileUrl": file.asset->url,
  credentialUrl,
  order
}`;
