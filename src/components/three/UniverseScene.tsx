"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/*  Nebula glow texture (canvas-generated radial gradient)             */
/* ------------------------------------------------------------------ */
function useNebulaTexture(color: string) {
  return useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.3, color);
    gradient.addColorStop(1, "transparent");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [color]);
}

/* ------------------------------------------------------------------ */
/*  Nebula spheres                                                     */
/* ------------------------------------------------------------------ */
function Nebula({ color, position, rotationSpeed, scale, opacity }: {
  color: string;
  position: [number, number, number];
  rotationSpeed: number;
  scale: number;
  opacity: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const texture = useNebulaTexture(color);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.z = clock.elapsedTime * rotationSpeed;
      ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.2) * 0.3;
    }
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  Multi-layer starfield                                              */
/* ------------------------------------------------------------------ */
const STAR_LAYERS = [
  { count: 4000, size: 0.015, color: "#b0c4de", opacity: 0.5, speed: 0.008, distance: 7 },
  { count: 1500, size: 0.03, color: "#d4e4f7", opacity: 0.6, speed: 0.015, distance: 6 },
  { count: 400, size: 0.06, color: "#ffffff", opacity: 0.75, speed: 0.022, distance: 5 },
  { count: 40, size: 0.12, color: "#ffffff", opacity: 0.9, speed: 0.03, distance: 4.5 },
];

function StarLayer({ count, size, color, opacity: baseOpacity, speed, distance }: typeof STAR_LAYERS[number]) {
  const meshRef = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = distance * (0.6 + Math.random() * 0.4);
      pos[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
      pos[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r;
      pos[i * 3 + 2] = Math.cos(phi) * r;
    }
    return pos;
  }, [count, distance]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * speed;
      meshRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.05 + distance) * 0.08;
    }
    if (matRef.current) {
      matRef.current.opacity = baseOpacity + Math.sin(clock.elapsedTime * (0.5 + distance * 0.1)) * 0.1;
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

function MultiLayerStarfield() {
  return (
    <>
      {STAR_LAYERS.map((layer, i) => (
        <StarLayer key={i} {...layer} />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Glowing core + central wireframe shape                             */
/* ------------------------------------------------------------------ */
function CentralShape() {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

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
        color: "#22d3ee",
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = clock.elapsedTime * 0.12;
      groupRef.current.rotation.y = clock.elapsedTime * 0.18;
      groupRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.1) * 0.15;
    }
    lineMat.opacity = 0.1 + Math.sin(clock.elapsedTime * 0.7) * 0.05;
    if (coreRef.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 1.5) * 0.2;
      coreRef.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Subtle solid fill */}
      <mesh geometry={geo}>
        <meshBasicMaterial
          color="#06b6d4"
          transparent
          opacity={0.03}
          depthWrite={false}
        />
      </mesh>
      {/* Wireframe overlay */}
      <lineSegments geometry={wireframeEdges} material={lineMat} />
      {/* Glowing core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.04, 32, 32]} />
        <meshBasicMaterial
          color="#06b6d4"
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Orbital rings with particles                                       */
/* ------------------------------------------------------------------ */
const RING_CONFIGS = [
  { radius: 1.3, tube: 0.008, rotationX: Math.PI * 0.15, speed: 0.25, color: "#22d3ee" },
  { radius: 1.5, tube: 0.006, rotationX: Math.PI * 0.55, speed: -0.18, color: "#a855f7" },
  { radius: 1.1, tube: 0.005, rotationX: Math.PI * 0.35, speed: 0.32, color: "#06b6d4" },
];

function OrbitalRing({
  radius,
  tube,
  rotationX,
  speed,
  color,
}: typeof RING_CONFIGS[number]) {
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
        color={color}
        transparent
        opacity={0.06}
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
/*  Shooting stars                                                     */
/* ------------------------------------------------------------------ */
interface ShootingStar {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  progress: number;
  speed: number;
  life: number; // 0..1, fades out
}

function ShootingStars() {
  const [stars, setStars] = useState<ShootingStar[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    const spawn = () => {
      const angle = (Math.random() - 0.5) * Math.PI * 0.6 - Math.PI * 0.25;
      const len = 2 + Math.random() * 3;
      const sx = (Math.random() - 0.5) * 6;
      const sy = (Math.random() - 0.5) * 4;
      const newStar: ShootingStar = {
        id: nextId.current++,
        startX: sx,
        startY: sy,
        endX: sx + Math.cos(angle) * len,
        endY: sy + Math.sin(angle) * len,
        progress: 0,
        speed: 0.008 + Math.random() * 0.02,
        life: 0,
      };
      setStars((prev) => [...prev.slice(-2), newStar]);
    };

    // Spawn at random intervals
    const id = setInterval(spawn, 3000 + Math.random() * 5000);
    return () => clearInterval(id);
  }, []);

  useFrame((_, delta) => {
    setStars((prev) =>
      prev
        .map((s) => ({ ...s, progress: s.progress + s.speed * delta * 60 }))
        .filter((s) => s.progress < 1)
    );
  });

  return (
    <>
      {stars.map((s) => {
        const x = THREE.MathUtils.lerp(s.startX, s.endX, s.progress);
        const y = THREE.MathUtils.lerp(s.startY, s.endY, s.progress);
        const alpha = s.progress < 0.2
          ? s.progress / 0.2
          : 1 - (s.progress - 0.2) / 0.8;

        return (
          <group key={s.id} position={[x, y, 0]}>
            {/* Head */}
            <mesh>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={alpha}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
            {/* Tail */}
            <mesh
              position={[
                (s.startX - s.endX) * 0.08,
                (s.startY - s.endY) * 0.08,
                0,
              ]}
            >
              <sphereGeometry args={[0.015, 6, 6]} />
              <meshBasicMaterial
                color="#a855f7"
                transparent
                opacity={alpha * 0.5}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Mouse parallax                                                     */
/* ------------------------------------------------------------------ */
function MouseParallax() {
  const mouse = useRef({ x: 0, y: 0 });

  useFrame(({ camera }) => {
    const targetX = mouse.current.x * 0.4;
    const targetY = -mouse.current.y * 0.4;
    camera.position.x += (targetX - camera.position.x) * 0.02;
    camera.position.y += (targetY - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);
  });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return null;
}

/* ------------------------------------------------------------------ */
/*  Scene container                                                    */
/* ------------------------------------------------------------------ */
export default function UniverseScene() {
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

  if (isLight) return null;

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
      <color attach="background" args={["#080C28"]} />

      {/* Nebula clouds */}
      <Nebula color="#06b6d4" position={[1.5, 0.8, -2]} rotationSpeed={0.08} scale={3} opacity={0.015} />
      <Nebula color="#a855f7" position={[-1.8, -0.5, -2.5]} rotationSpeed={-0.06} scale={2.5} opacity={0.015} />
      <Nebula color="#22d3ee" position={[0.3, -1.2, -2]} rotationSpeed={0.05} scale={2.8} opacity={0.015} />

      <MultiLayerStarfield />
      <OrbitalRings />
      <CentralShape />
      <ShootingStars />
      <MouseParallax />

      {/* Bloom — makes bright elements glow */}
      <EffectComposer>
        <Bloom
          intensity={0.15}
          luminanceThreshold={0.5}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
