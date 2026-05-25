"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/*  Starfield                                                          */
/* ------------------------------------------------------------------ */
function Starfield({ count = 2500 }: { count?: number }) {
  const meshRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3.5 + Math.random() * 5;
      pos[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
      pos[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r;
      pos[i * 3 + 2] = Math.cos(phi) * r;
    }
    return pos;
  }, [count]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * 0.015;
      meshRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.1) * 0.1;
    }
    if (materialRef.current) {
      materialRef.current.opacity = 0.6 + Math.sin(clock.elapsedTime * 0.8) * 0.15;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.025}
        color="#c7d2fe"
        sizeAttenuation
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/*  Central wireframe shape                                            */
/* ------------------------------------------------------------------ */
function CentralShape() {
  const groupRef = useRef<THREE.Group>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);

  const geo = useMemo(
    () => new THREE.TorusKnotGeometry(0.7, 0.15, 128, 16),
    []
  );

  const wireframeEdges = useMemo(
    () => new THREE.EdgesGeometry(geo, 15),
    [geo]
  );

  const lineMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: "#6366f1",
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = clock.elapsedTime * 0.15;
      groupRef.current.rotation.y = clock.elapsedTime * 0.2;
    }
    lineMat.opacity = 0.25 + Math.sin(clock.elapsedTime * 0.6) * 0.1;
  });

  return (
    <group ref={groupRef}>
      {/* Solid fill — very subtle */}
      <mesh ref={wireframeRef} geometry={geo}>
        <meshBasicMaterial
          color="#6366f1"
          transparent
          opacity={0.03}
          depthWrite={false}
        />
      </mesh>
      {/* Wireframe overlay */}
      <lineSegments geometry={wireframeEdges} material={lineMat} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Orbital rings                                                      */
/* ------------------------------------------------------------------ */
const RING_CONFIGS = [
  { radius: 1.3, tube: 0.008, rotationX: Math.PI * 0.15, speed: 0.25 },
  { radius: 1.5, tube: 0.006, rotationX: Math.PI * 0.55, speed: -0.18 },
  { radius: 1.1, tube: 0.005, rotationX: Math.PI * 0.35, speed: 0.32 },
];

function OrbitalRing({
  radius,
  tube,
  rotationX,
  speed,
}: {
  radius: number;
  tube: number;
  rotationX: number;
  speed: number;
}) {
  const ringRef = useRef<THREE.Mesh>(null);

  const torusGeo = useMemo(
    () => new THREE.TorusGeometry(radius, tube, 64, 128),
    [radius, tube]
  );

  useFrame(({ clock }) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = clock.elapsedTime * speed;
      ringRef.current.rotation.x = rotationX;
    }
  });

  return (
    <mesh ref={ringRef} geometry={torusGeo}>
      <meshBasicMaterial
        color="#818cf8"
        transparent
        opacity={0.12}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

function OrbitalRings() {
  return (
    <group>
      {RING_CONFIGS.map((cfg, i) => (
        <OrbitalRing key={i} {...cfg} />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Mouse parallax                                                     */
/* ------------------------------------------------------------------ */
function MouseParallax() {
  const mouse = useRef({ x: 0, y: 0 });

  useFrame(({ camera }) => {
    const targetX = mouse.current.x * 0.3;
    const targetY = -mouse.current.y * 0.3;
    camera.position.x += (targetX - camera.position.x) * 0.03;
    camera.position.y += (targetY - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });

  // Track mouse globally (the Canvas fills the hero, so window is fine)
  const onMove = (e: MouseEvent) => {
    mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
  };

  // This is a side-effect in the render tree — R3F handles cleanup
  if (typeof window !== "undefined") {
    window.removeEventListener("mousemove", onMove);
    window.addEventListener("mousemove", onMove);
  }

  return null;
}

/* ------------------------------------------------------------------ */
/*  Scene container                                                    */
/* ------------------------------------------------------------------ */
export default function UniverseScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 55 }}
      dpr={[1, 2]}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
      }}
      style={{ position: "absolute", inset: 0 }}
    >
      <AdaptiveDpr pixelated />
      <Starfield />
      <OrbitalRings />
      <CentralShape />
      <MouseParallax />
    </Canvas>
  );
}
