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
/*  Star texture — canvas-generated starburst shape                    */
/* ------------------------------------------------------------------ */
function useStarTexture() {
  return useMemo(() => {
    const size = 128;
    const half = size / 2;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    // Radial glow from center
    const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.05, "rgba(255,255,255,0.95)");
    gradient.addColorStop(0.2, "rgba(255,255,255,0.5)");
    gradient.addColorStop(0.4, "rgba(255,255,255,0.1)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Starburst spikes — 4 diagonal + 4 cardinal
    ctx.globalCompositeOperation = "lighter";
    const spikes = [
      [0, 1], [0, -1], [1, 0], [-1, 0],          // cardinal
      [0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7], // diagonal
    ];
    for (const [dx, dy] of spikes) {
      const spikeGrad = ctx.createLinearGradient(
        half, half,
        half + dx * half, half + dy * half
      );
      spikeGrad.addColorStop(0, "rgba(255,255,255,0.8)");
      spikeGrad.addColorStop(0.15, "rgba(255,255,255,0.3)");
      spikeGrad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.beginPath();
      ctx.moveTo(half, half);
      ctx.lineTo(half + dx * half, half + dy * half);
      ctx.lineWidth = 3;
      ctx.strokeStyle = spikeGrad;
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);
}

/* ------------------------------------------------------------------ */
/*  Multi-layer starfield                                              */
/* ------------------------------------------------------------------ */
const STAR_LAYERS = [
  { count: 2200, size: 0.016, color: "#b0c4de", opacity: 0.5, speed: 0.008, distance: 7 },
  { count: 900, size: 0.032, color: "#d4e4f7", opacity: 0.6, speed: 0.015, distance: 6 },
  { count: 250, size: 0.065, color: "#ffffff", opacity: 0.75, speed: 0.022, distance: 5 },
  { count: 35, size: 0.14, color: "#ffffff", opacity: 0.9, speed: 0.03, distance: 4.5 },
];

function StarLayer({ count, size, color, opacity: baseOpacity, speed, distance }: typeof STAR_LAYERS[number]) {
  const meshRef = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);
  const starTexture = useStarTexture();

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
    () => new THREE.TorusKnotGeometry(0.7, 0.15, 96, 12),
    []
  );

  const wireframeEdges = useMemo(
    () => new THREE.EdgesGeometry(geo, 30),
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
    () => new THREE.TorusGeometry(radius, tube, 32, 64),
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
/*  Star click explosions                                               */
/* ------------------------------------------------------------------ */
interface Explosion {
  id: number;
  position: [number, number, number];
  age: number;
}

const EXPLOSION_PARTICLE_COUNT = 25;
const EXPLOSION_LIFETIME = 1.5;

function StarExplosions({
  explosions,
}: {
  explosions: Explosion[];
}) {
  if (explosions.length === 0) return null;

  return (
    <>
      {explosions.map((exp) => (
        <ExplosionBurst key={exp.id} explosion={exp} />
      ))}
    </>
  );
}

function ExplosionBurst({ explosion }: { explosion: Explosion }) {
  const pointsRef = useRef<THREE.Points>(null);
  const velocitiesRef = useRef<Float32Array | null>(null);
  const ageRef = useRef(0);

  const positions = useMemo(() => {
    const pos = new Float32Array(EXPLOSION_PARTICLE_COUNT * 3);
    return pos;
  }, []);

  // Generate velocities once
  if (!velocitiesRef.current) {
    const vel = new Float32Array(EXPLOSION_PARTICLE_COUNT * 3);
    for (let i = 0; i < EXPLOSION_PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 0.3 + Math.random() * 1.2;
      vel[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      vel[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
      vel[i * 3 + 2] = Math.cos(phi) * speed;
    }
    velocitiesRef.current = vel;
  }

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    ageRef.current += delta;
    const t = ageRef.current / EXPLOSION_LIFETIME;
    if (t >= 1) return;

    const vel = velocitiesRef.current!;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const posArray = posAttr.array as Float32Array;

    for (let i = 0; i < EXPLOSION_PARTICLE_COUNT; i++) {
      const ix = i * 3;
      posArray[ix] = vel[ix] * t;
      posArray[ix + 1] = vel[ix + 1] * t;
      posArray[ix + 2] = vel[ix + 2] * t;
    }
    posAttr.needsUpdate = true;

    const mat = pointsRef.current.material as THREE.PointsMaterial;
    mat.opacity = 1 - t;
  });

  return (
    <points ref={pointsRef} position={explosion.position}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#cffafe"
        sizeAttenuation
        transparent
        opacity={1}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/*  Satellite model                                                    */
/* ------------------------------------------------------------------ */
function SatelliteModel({ color }: { color: string }) {
  return (
    <group>
      {/* Body */}
      <mesh>
        <boxGeometry args={[0.12, 0.06, 0.06]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Solar panel left */}
      <mesh position={[-0.12, 0, 0]}>
        <boxGeometry args={[0.1, 0.01, 0.16]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Solar panel right */}
      <mesh position={[0.12, 0, 0]}>
        <boxGeometry args={[0.1, 0.01, 0.16]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Antenna */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.08, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Antenna dish */}
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshBasicMaterial color="#cffafe" transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Orbiting satellites                                                */
/* ------------------------------------------------------------------ */
const SATELLITES = [
  { orbitR: 1.8, speed: 0.35, tilt: 0.3, color: "#22d3ee" },
  { orbitR: 2.4, speed: -0.28, tilt: -0.5, color: "#a855f7" },
  { orbitR: 2.1, speed: 0.45, tilt: 0.7, color: "#06b6d4" },
];

function Satellites() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const cfg = SATELLITES[i];
      const t = clock.elapsedTime * cfg.speed;
      child.position.x = Math.cos(t) * cfg.orbitR;
      child.position.z = Math.sin(t) * cfg.orbitR;
      child.position.y = Math.sin(t * 0.6) * cfg.tilt;
      // Face direction of orbit
      child.rotation.z = -t;
      child.rotation.y = Math.sin(t * 0.5) * 0.3;
    });
  });

  return (
    <group ref={groupRef}>
      {SATELLITES.map((cfg, i) => (
        <SatelliteModel key={i} color={cfg.color} />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Wormhole / portal                                                  */
/* ------------------------------------------------------------------ */
function Wormhole() {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  const starTexture = useStarTexture();
  const particleCount = 80;

  const { positions, colors, radii, speeds, angles } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const cols = new Float32Array(particleCount * 3);
    const rads = new Float32Array(particleCount);
    const spds = new Float32Array(particleCount);
    const angs = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const r = 0.2 + Math.random() * 1.0;
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 0.3;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(angle) * r;
      rads[i] = r;
      spds[i] = 0.6 + Math.random() * 1.2;
      angs[i] = angle;
      const c = new THREE.Color();
      c.setHSL(0.52 + Math.random() * 0.08, 0.8, 0.5 + Math.random() * 0.4);
      cols[i * 3] = c.r;
      cols[i * 3 + 1] = c.g;
      cols[i * 3 + 2] = c.b;
    }
    return { positions: pos, colors: cols, radii: rads, speeds: spds, angles: angs };
  }, []);

  useFrame(({ clock }, delta) => {
    if (!particlesRef.current) return;
    const posAttr = particlesRef.current.geometry.attributes.position;
    const posArray = posAttr.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      angles[i] += speeds[i] * delta * 1.2;
      // Flow toward center then reset
      let r = radii[i] - delta * 0.08;
      if (r < 0.05) r = 0.8 + Math.random() * 0.4;
      radii[i] = r;
      const y = (Math.random() - 0.5) * 0.2 * (r / 1.2);
      posArray[i * 3] = Math.cos(angles[i]) * r;
      posArray[i * 3 + 1] = y;
      posArray[i * 3 + 2] = Math.sin(angles[i]) * r;
    }
    posAttr.needsUpdate = true;

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += delta * 0.3;
      outerRingRef.current.rotation.x += delta * 0.15;
    }

    // Orbit around center
    if (groupRef.current) {
      const t = clock.elapsedTime * 0.15;
      groupRef.current.position.x = Math.cos(t) * 2.2;
      groupRef.current.position.y = Math.sin(t * 0.7) * 0.5;
      groupRef.current.position.z = Math.sin(t) * 1.5;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer ring — bright cyan */}
      <mesh ref={outerRingRef} rotation={[Math.PI / 2.5, 0.3, 0]}>
        <torusGeometry args={[0.55, 0.02, 16, 80]} />
        <meshBasicMaterial
          color="#22d3ee"
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Inner ring — magenta */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.15, 0.012, 16, 64]} />
        <meshBasicMaterial
          color="#a855f7"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Swirling particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          vertexColors
          map={starTexture}
          sizeAttenuation
          transparent
          opacity={0.75}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Draggable wireframe planet                                         */
/* ------------------------------------------------------------------ */
function Planet() {
  const outerGroupRef = useRef<THREE.Group>(null);
  const spinGroupRef = useRef<THREE.Group>(null);
  const planetHitRef = useRef<THREE.Mesh>(null);
  const isDragging = useRef(false);
  const prevPointer = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const basePos = useRef({ x: 2.2, y: 1.2 });

  const icosaGeo = useMemo(
    () => new THREE.IcosahedronGeometry(0.55, 4),
    []
  );
  const edgeGeo = useMemo(
    () => new THREE.EdgesGeometry(icosaGeo, 30),
    [icosaGeo]
  );

  // Sync wireframe rotation with spin group
  useFrame(({ clock, pointer }) => {
    if (!outerGroupRef.current || !spinGroupRef.current) return;

    // Float drift when not dragging
    if (!isDragging.current) {
      // Gentle orbit + subtle follow toward cursor (pointer is NDC -1..1)
      const targetX = basePos.current.x + Math.sin(clock.elapsedTime * 0.3) * 0.5 + pointer.x * 0.4;
      const targetY = basePos.current.y + Math.cos(clock.elapsedTime * 0.4) * 0.4 + pointer.y * 0.3;
      outerGroupRef.current.position.x +=
        (targetX - outerGroupRef.current.position.x) * 0.015;
      outerGroupRef.current.position.y +=
        (targetY - outerGroupRef.current.position.y) * 0.015;

      // Apply inertia spin (to the spin group, everything inside rotates together)
      spinGroupRef.current.rotation.y += velocity.current.x;
      spinGroupRef.current.rotation.x += velocity.current.y;
      velocity.current.x *= 0.96;
      velocity.current.y *= 0.96;
    }
  });

  const handleDown = (e: any) => {
    e.stopPropagation();
    isDragging.current = true;
    prevPointer.current = { x: e.clientX, y: e.clientY };
    velocity.current = { x: 0, y: 0 };
  };

  const handleMove = (e: any) => {
    if (!isDragging.current || !spinGroupRef.current) return;
    const dx = (e.clientX - prevPointer.current.x) * 0.01;
    const dy = (e.clientY - prevPointer.current.y) * 0.01;
    spinGroupRef.current.rotation.y += dx;
    spinGroupRef.current.rotation.x += dy;
    velocity.current = { x: dx, y: dy };
    prevPointer.current = { x: e.clientX, y: e.clientY };
  };

  const handleUp = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, []);

  return (
    <group ref={outerGroupRef} position={[2.2, 1.2, -1]}>
      {/* Spin group — everything inside rotates together */}
      <group ref={spinGroupRef}>
        {/* Clickable hit target (transparent) */}
        <mesh
          ref={planetHitRef}
          onPointerDown={handleDown}
          geometry={icosaGeo}
        >
          <meshBasicMaterial
            color="#06b6d4"
            transparent
            opacity={0.01}
            depthWrite={false}
          />
        </mesh>

        {/* Wireframe edges */}
        <lineSegments geometry={edgeGeo}>
          <lineBasicMaterial
            color="#22d3ee"
            transparent
            opacity={0.3}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>

        {/* Inner glow */}
        <mesh>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshBasicMaterial
            color="#06b6d4"
            transparent
            opacity={0.04}
            depthWrite={false}
          />
        </mesh>

        {/* Subtle ring */}
        <mesh rotation={[Math.PI * 0.45, 0, 0]}>
          <torusGeometry args={[0.75, 0.012, 32, 80]} />
          <meshBasicMaterial
            color="#a855f7"
            transparent
            opacity={0.15}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Scene container                                                    */
/* ------------------------------------------------------------------ */
export default function UniverseScene() {
  const [isLight, setIsLight] = useState(false);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const nextExplosionId = useRef(0);

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

  // Clean up old explosions
  useEffect(() => {
    if (explosions.length === 0) return;
    const id = setInterval(() => {
      setExplosions((prev) =>
        prev.filter((e) => e.age < EXPLOSION_LIFETIME)
      );
    }, 200);
    return () => clearInterval(id);
  }, [explosions.length]);

  const handleClick = (e: any) => {
    e.stopPropagation();
    const pos = e.point as THREE.Vector3;
    if (!pos) return;
    const exp: Explosion = {
      id: nextExplosionId.current++,
      position: [pos.x, pos.y, pos.z],
      age: 0,
    };
    setExplosions((prev) => [...prev.slice(-5), exp]);
  };

  return (
    <Canvas
      style={{ position: "absolute", inset: 0, filter: isLight ? "invert(1)" : "none" }}
      camera={{ position: [0, 0, 5], fov: 55 }}
      dpr={[1, 1.25]}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
      }}
    >
      <AdaptiveDpr pixelated />
      <color attach="background" args={["#080C28"]} />

      {/* Invisible click catcher */}
      <mesh onClick={handleClick} position={[0, 0, -0.5]}>
        <planeGeometry args={[20, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false}
          depthTest={false}
        />
      </mesh>

      <MultiLayerStarfield />
      <OrbitalRings />
      <Wormhole />
      <Satellites />
      <CentralShape />
      <Planet />
      <ShootingStars />
      <StarExplosions explosions={explosions} />
      <MouseParallax />

      {/* Bloom — makes bright elements glow */}
      <EffectComposer>
        <Bloom
          intensity={0.15}
          luminanceThreshold={0.5}
          luminanceSmoothing={0.9}
          resolutionScale={0.5}
        />
      </EffectComposer>
    </Canvas>
  );
}
