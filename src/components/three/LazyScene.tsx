"use client";

import dynamic from "next/dynamic";

export const LazyUniverseScene = dynamic(
  () => import("@/components/three/UniverseScene"),
  { ssr: false }
);

export const LazyBackgroundParticles = dynamic(
  () => import("@/components/three/BackgroundParticles"),
  { ssr: false }
);
