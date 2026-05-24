import { defineType, defineField } from "sanity";

export default defineType({
  name: "project",
  title: "Projects",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Short Description",
      type: "text",
      rows: 2,
      description: "Shown on the project card",
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "screenshots",
      title: "Screenshots Gallery",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "technologies",
      title: "Technologies Used",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({ name: "liveUrl", title: "Live Demo URL", type: "url" }),
    defineField({ name: "sourceUrl", title: "Source Code URL", type: "url" }),
    defineField({
      name: "videoUrl",
      title: "Demo / Explainer Video URL",
      type: "url",
      description: "YouTube, Vimeo, or Loom video URL. Shown in the project detail modal.",
    }),
    defineField({
      name: "featured",
      title: "Featured Project",
      type: "boolean",
      initialValue: true,
    }),
    defineField({ name: "order", title: "Display Order", type: "number" }),
    defineField({
      name: "problem",
      title: "The Problem",
      type: "array",
      of: [{ type: "block" }],
      description: "What challenge did this project solve?",
    }),
    defineField({
      name: "solution",
      title: "The Solution",
      type: "array",
      of: [{ type: "block" }],
      description: "How did you approach and implement it?",
    }),
    defineField({
      name: "result",
      title: "The Result",
      type: "array",
      of: [{ type: "block" }],
      description: "What was the impact, metrics, or outcome?",
    }),
  ],
  orderings: [
    {
      title: "Display Order",
      name: "order",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "description",
      media: "coverImage",
    },
  },
});
