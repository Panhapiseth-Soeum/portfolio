import { defineType, defineField } from "sanity";

export default defineType({
  name: "certificate",
  title: "Certificates",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Certificate Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "issuer",
      title: "Issuing Organization",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "date",
      title: "Date Earned",
      type: "date",
    }),
    defineField({
      name: "image",
      title: "Certificate Image",
      type: "image",
      options: { hotspot: true },
      description: "Upload a screenshot or scan of the certificate",
    }),
    defineField({
      name: "file",
      title: "PDF Download",
      type: "file",
      options: { accept: ".pdf" },
      description: "Optional: upload the original PDF certificate for download",
    }),
    defineField({
      name: "credentialUrl",
      title: "Credential Verification URL",
      type: "url",
      description: "Optional: link to verify the credential (e.g., Coursera, Credly)",
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
    select: {
      title: "title",
      subtitle: "issuer",
      media: "image",
    },
  },
});
