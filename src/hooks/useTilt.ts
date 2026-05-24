"use client";

import { useState, useCallback } from "react";
import { useReducedMotion } from "framer-motion";

interface TiltValues {
  rotateX: number;
  rotateY: number;
  glareX: number;
  glareY: number;
}

interface UseTiltOptions {
  maxTilt?: number;
}

interface UseTiltReturn {
  tilt: TiltValues;
  onMouseMove: (e: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave: () => void;
  prefersReducedMotion: boolean;
}

const zero = { rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 };

export function useTilt({ maxTilt = 6 }: UseTiltOptions = {}): UseTiltReturn {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [tilt, setTilt] = useState<TiltValues>(zero);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (prefersReducedMotion) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      setTilt({
        rotateX: (y - 0.5) * -maxTilt * 2,
        rotateY: (x - 0.5) * maxTilt * 2,
        glareX: x * 100,
        glareY: y * 100,
      });
    },
    [maxTilt, prefersReducedMotion]
  );

  const onMouseLeave = useCallback(() => {
    setTilt(zero);
  }, []);

  return { tilt, onMouseMove, onMouseLeave, prefersReducedMotion };
}
