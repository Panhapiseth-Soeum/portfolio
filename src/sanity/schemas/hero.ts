import { defineType, defineField } from "sanity";

export default defineType({
  name: "hero",
  title: "Hero Section",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Your Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "role",
      title: "Role / Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Value Proposition",
      type: "text",
      rows: 3,
      description: "One-liner that hooks visitors",
    }),
    defineField({
      name: "ctaPrimary",
      title: "Primary CTA",
      type: "object",
      fields: [
        defineField({ name: "label", title: "Button Label", type: "string" }),
        defineField({
          name: "href",
          title: "Link (URL or #section)",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "ctaSecondary",
      title: "Secondary CTA",
      type: "object",
      fields: [
        defineField({ name: "label", title: "Button Label", type: "string" }),
        defineField({
          name: "href",
          title: "Link (URL or #section)",
          type: "string",
        }),
      ],
    }),
  ],
});
