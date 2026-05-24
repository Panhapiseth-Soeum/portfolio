import { createImageUrlBuilder } from "@sanity/image-url";
import { projectId, dataset } from "./env";
import type { SanityImage } from "@/types/sanity";

const builder = createImageUrlBuilder({ projectId, dataset });

export function urlForImage(source: SanityImage) {
  return builder.image(source).auto("format").fit("max");
}
