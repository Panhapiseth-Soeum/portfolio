import Image from "next/image";
import { urlForImage } from "@/sanity/image";
import type { SanityImage as SanityImageType } from "@/types/sanity";
import { cn } from "@/lib/utils";

interface SanityImageProps {
  image: SanityImageType;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
}

export default function SanityImage({
  image,
  alt,
  width = 800,
  height = 600,
  className,
  priority = false,
  fill = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
}: SanityImageProps) {
  const src = urlForImage(image).width(width).height(height).url();

  return (
    <Image
      src={src}
      alt={alt || image.alt || ""}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", className)}
    />
  );
}
