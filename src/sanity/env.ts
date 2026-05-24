export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "placeholder";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";
export const useCdn = true;
export const token = process.env.SANITY_API_TOKEN;
export const revalidateSecret = process.env.SANITY_REVALIDATE_SECRET;

export const isConfigured =
  !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "placeholder";
