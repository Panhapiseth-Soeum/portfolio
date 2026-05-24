"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SanityImage from "@/components/shared/SanityImage";
import type { SanityImage as SanityImageType } from "@/types/sanity";

interface ImageCarouselProps {
  images: SanityImageType[];
  title: string;
  autoPlayInterval?: number;
}

const swipeThreshold = 50;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

export default function ImageCarousel({
  images,
  title,
  autoPlayInterval = 5000,
}: ImageCarouselProps) {
  const prefersReducedMotion = useReducedMotion();
  const [[currentIndex, direction], setState] = useState([0, 0]);
  const [isHovered, setIsHovered] = useState(false);

  const len = images.length;

  const goTo = useCallback(
    (newDirection: number) => {
      setState(([prev]) => [
        (prev + newDirection + len) % len,
        newDirection,
      ]);
    },
    [len]
  );

  const next = useCallback(() => goTo(1), [goTo]);
  const prev = useCallback(() => goTo(-1), [goTo]);

  // Auto-advance
  useEffect(() => {
    if (prefersReducedMotion || isHovered || len <= 1) return;
    const id = setInterval(next, autoPlayInterval);
    return () => clearInterval(id);
  }, [prefersReducedMotion, isHovered, len, next, autoPlayInterval]);

  if (len === 0) return null;

  if (prefersReducedMotion || len === 1) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-xl border border-[var(--border-color)]">
        <SanityImage
          image={images[0]}
          alt={`${title} screenshot`}
          fill
          sizes="(max-width: 768px) 100vw, 700px"
        />
      </div>
    );
  }

  return (
    <div
      className="relative aspect-video overflow-hidden rounded-xl border border-[var(--border-color)] bg-black"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.x > swipeThreshold) prev();
            else if (info.offset.x < -swipeThreshold) next();
          }}
          className="absolute inset-0"
        >
          <SanityImage
            image={images[currentIndex]}
            alt={`${title} screenshot ${currentIndex + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 700px"
          />
        </motion.div>
      </AnimatePresence>

      {isHovered && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-opacity hover:bg-black/70"
            aria-label="Previous screenshot"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-opacity hover:bg-black/70"
            aria-label="Next screenshot"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setState([i, i > currentIndex ? 1 : -1])}
            className={`rounded-full transition-all ${
              i === currentIndex
                ? "h-1.5 w-4 bg-white"
                : "h-1.5 w-1.5 bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to screenshot ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
