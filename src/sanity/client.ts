import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion, useCdn, isConfigured } from "./env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
  perspective: "published",
  stega: { enabled: false },
});

export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "previewDrafts",
  token: process.env.SANITY_API_TOKEN,
  stega: {
    enabled: isConfigured,
    studioUrl: "/studio",
  },
});
