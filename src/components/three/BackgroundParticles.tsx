"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import * as THREE from "three";

const PARTICLE_LAYERS = [
  { count: 400, size: 0.015, color: "#fef3c7", opacity: 0.2, speed: 0.006 },
  { count: 150, size: 0.028, color: "#dbeafe", opacity: 0.3, speed: 0.012 },
];

function ParticleLayer({
  count,
  size,
  color,
  opacity: baseOpacity,
  speed,
}: (typeof PARTICLE_LAYERS)[number]) {
  const meshRef = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return pos;
  }, [count]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * speed;
      meshRef.current.position.y = Math.sin(clock.elapsedTime * 0.12) * 0.25;
    }
    if (matRef.current) {
      matRef.current.opacity =
        baseOpacity + Math.sin(clock.elapsedTime * 0.4) * 0.05;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        size={size}
        color={color}
        sizeAttenuation
        transparent
        opacity={baseOpacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function BackgroundParticles() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      dpr={[0.5, 1]}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
      }}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <AdaptiveDpr pixelated />
      {PARTICLE_LAYERS.map((layer, i) => (
        <ParticleLayer key={i} {...layer} />
      ))}
    </Canvas>
  );
}
