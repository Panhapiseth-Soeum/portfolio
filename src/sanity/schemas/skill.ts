import { defineType, defineField } from "sanity";

export default defineType({
  name: "skill",
  title: "Skills",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Skill Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Languages", value: "languages" },
          { title: "Frameworks", value: "frameworks" },
          { title: "Tools & Platforms", value: "tools" },
          { title: "Databases", value: "databases" },
          { title: "Design", value: "design" },
          { title: "Other", value: "other" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "icon",
      title: "Icon (Lucide name)",
      type: "string",
      description: "e.g., Code2, Database, Palette, Terminal",
    }),
    defineField({ name: "order", title: "Display Order", type: "number" }),
  ],
  orderings: [
    {
      title: "Display Order",
      name: "order",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "name", subtitle: "category" },
  },
});
