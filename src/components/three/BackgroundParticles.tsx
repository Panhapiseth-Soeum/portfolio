"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import * as THREE from "three";

function useStarTexture() {
  return useMemo(() => {
    const size = 128;
    const half = size / 2;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.05, "rgba(255,255,255,0.95)");
    gradient.addColorStop(0.2, "rgba(255,255,255,0.5)");
    gradient.addColorStop(0.4, "rgba(255,255,255,0.1)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    ctx.globalCompositeOperation = "lighter";
    const spikes = [[0,1],[0,-1],[1,0],[-1,0],[0.7,0.7],[-0.7,0.7],[0.7,-0.7],[-0.7,-0.7]];
    for (const [dx, dy] of spikes) {
      const g = ctx.createLinearGradient(half, half, half + dx * half, half + dy * half);
      g.addColorStop(0, "rgba(255,255,255,0.8)");
      g.addColorStop(0.15, "rgba(255,255,255,0.3)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.beginPath();
      ctx.moveTo(half, half);
      ctx.lineTo(half + dx * half, half + dy * half);
      ctx.lineWidth = 3;
      ctx.strokeStyle = g;
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);
}

const PARTICLE_LAYERS = [
  { count: 3000, size: 0.03, color: "#fef3c7", opacity: 0.55, speed: 0.005 },
  { count: 1200, size: 0.06, color: "#dbeafe", opacity: 0.7, speed: 0.01 },
  { count: 400, size: 0.12, color: "#ffffff", opacity: 0.85, speed: 0.018 },
  { count: 60, size: 0.2, color: "#ffffff", opacity: 0.9, speed: 0.025 },
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
  const starTexture = useStarTexture();

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
        map={starTexture}
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
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const check = () =>
      setIsLight(document.documentElement.classList.contains("light"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      dpr={[0.75, 1.25]}
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
        filter: isLight ? "invert(1)" : "none",
      }}
    >
      <color attach="background" args={["#080C28"]} />
      <AdaptiveDpr pixelated />
      {PARTICLE_LAYERS.map((layer, i) => (
        <ParticleLayer key={i} {...layer} />
      ))}
    </Canvas>
  );
}
