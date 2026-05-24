import { client } from "./client";
import { isConfigured } from "./env";

export async function sanityFetch<T>({
  query,
  params = {},
  tags,
}: {
  query: string;
  params?: Record<string, unknown>;
  tags: string[];
}): Promise<T> {
  if (!isConfigured) throw new Error("Sanity is not configured");
  return client.fetch<T>(query, params, {
    next: { tags, revalidate: 60 },
  });
}
