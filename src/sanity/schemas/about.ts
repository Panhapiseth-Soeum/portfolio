import { defineType, defineField } from "sanity";

export default defineType({
  name: "about",
  title: "About Section",
  type: "document",
  fields: [
    defineField({
      name: "headline",
      title: "Section Headline",
      type: "string",
    }),
    defineField({
      name: "bio",
      title: "Biography",
      type: "array",
      of: [
        {
          type: "block",
          styles: [{ title: "Normal", value: "normal" }],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
              { title: "Code", value: "code" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  defineField({
                    name: "href",
                    title: "URL",
                    type: "url",
                  }),
                ],
              },
            ],
          },
        },
      ],
    }),
    defineField({
      name: "profilePhoto",
      title: "Profile Photo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "resume",
      title: "Resume / CV",
      type: "file",
      options: { accept: ".pdf" },
    }),
  ],
});
