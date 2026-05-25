"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 320;
const CONNECT_DISTANCE = 1.6;
const INFLUENCE_RADIUS = 3.5;
const ATTRACT_FORCE = 0.012;
const SPRING_FORCE = 0.006;
const DAMPING = 0.93;
const COLORS = ["#FF0000", "#FF0000", "#FF0000", "#FF0000", "#FF0000"];

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

let mouseNDC = { x: 0, y: 0 };
if (typeof window !== "undefined") {
  window.addEventListener("mousemove", (e) => {
    mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });
}

/* ------------------------------------------------------------------ */
/*  Floating geometric shapes for light mode                           */
/* ------------------------------------------------------------------ */
const SHAPES: {
  geo: THREE.BufferGeometry;
  edgeGeo: THREE.BufferGeometry;
  position: [number, number, number];
  color: string;
  speed: number;
  scale: number;
}[] = (() => {
  const ico = new THREE.IcosahedronGeometry(0.4, 1);
  const octa = new THREE.OctahedronGeometry(0.35, 0);
  const dodec = new THREE.DodecahedronGeometry(0.3, 0);
  const tetra = new THREE.TetrahedronGeometry(0.3, 0);
  return [
    { geo: ico, edgeGeo: new THREE.EdgesGeometry(ico, 30), position: [2.5, 1.5, -1], color: "#BBD5DA", speed: 0.3, scale: 1 },
    { geo: octa, edgeGeo: new THREE.EdgesGeometry(octa, 30), position: [-2.8, -1, -1.5], color: "#DFF1F1", speed: -0.25, scale: 1.1 },
    { geo: dodec, edgeGeo: new THREE.EdgesGeometry(dodec, 30), position: [3, -0.8, -0.5], color: "#FF0000", speed: 0.2, scale: 0.9 },
    { geo: tetra, edgeGeo: new THREE.EdgesGeometry(tetra, 30), position: [-2.5, 1.8, -1.2], color: "#BBD5DA", speed: -0.35, scale: 1 },
  ];
})();

function FloatingShapes() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock, pointer }) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const cfg = SHAPES[i];
      child.rotation.x = clock.elapsedTime * cfg.speed * 0.3;
      child.rotation.y = clock.elapsedTime * cfg.speed * 0.5;
      child.position.x +=
        (cfg.position[0] + pointer.x * 0.3 - child.position.x) * 0.02;
      child.position.y +=
        (cfg.position[1] + pointer.y * 0.2 - child.position.y) * 0.02;
    });
  });

  return (
    <group ref={groupRef}>
      {SHAPES.map((cfg, i) => (
        <group key={i} position={cfg.position} scale={cfg.scale}>
          <mesh geometry={cfg.geo}>
            <meshBasicMaterial color={cfg.color} transparent opacity={0.06} depthWrite={false} />
          </mesh>
          <lineSegments geometry={cfg.edgeGeo}>
            <lineBasicMaterial color={cfg.color} transparent opacity={0.25} depthWrite={false} />
          </lineSegments>
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Constellation network                                              */
/* ------------------------------------------------------------------ */
export function Constellation() {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const starTexture = useStarTexture();
  const velocitiesRef = useRef(new Float32Array(PARTICLE_COUNT * 3));
  const smoothCursorRef = useRef(new THREE.Vector3());
  const prevCursorRef = useRef(new THREE.Vector3());
  const activityRef = useRef(0);
  const raycasterRef = useRef(new THREE.Raycaster());
  const cursorWorldRef = useRef(new THREE.Vector3());
  const planeRef = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
  const { camera } = useThree();

  const { positions, colors, connections, anchors } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const cols = new Float32Array(PARTICLE_COUNT * 3);
    const anch = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const px = (Math.random() - 0.5) * 10;
      const py = (Math.random() - 0.5) * 7;
      const pz = (Math.random() - 0.5) * 4;
      pos[i * 3] = px;
      pos[i * 3 + 1] = py;
      pos[i * 3 + 2] = pz;
      anch[i * 3] = px;
      anch[i * 3 + 1] = py;
      anch[i * 3 + 2] = pz;
      const c = new THREE.Color(COLORS[Math.floor(Math.random() * COLORS.length)]);
      cols[i * 3] = c.r;
      cols[i * 3 + 1] = c.g;
      cols[i * 3 + 2] = c.b;
    }
    const links: [number, number][] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      for (let j = i + 1; j < PARTICLE_COUNT; j++) {
        const dx = pos[i * 3] - pos[j * 3];
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
        const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
        if (dx * dx + dy * dy + dz * dz < CONNECT_DISTANCE * CONNECT_DISTANCE) {
          links.push([i, j]);
        }
      }
    }
    return { positions: pos, colors: cols, connections: links, anchors: anch };
  }, []);

  const linePositions = useMemo(() => {
    const arr = new Float32Array(connections.length * 6);
    connections.forEach(([a, b], idx) => {
      arr[idx * 6] = positions[a * 3];
      arr[idx * 6 + 1] = positions[a * 3 + 1];
      arr[idx * 6 + 2] = positions[a * 3 + 2];
      arr[idx * 6 + 3] = positions[b * 3];
      arr[idx * 6 + 4] = positions[b * 3 + 1];
      arr[idx * 6 + 5] = positions[b * 3 + 2];
    });
    return arr;
  }, [positions, connections]);

  useFrame((_, delta) => {
    if (!pointsRef.current || !linesRef.current) return;

    raycasterRef.current.setFromCamera(
      new THREE.Vector2(mouseNDC.x, mouseNDC.y),
      camera
    );
    raycasterRef.current.ray.intersectPlane(planeRef.current, cursorWorldRef.current);

    const speed = prevCursorRef.current.distanceTo(cursorWorldRef.current);
    prevCursorRef.current.copy(cursorWorldRef.current);
    const isMoving = speed > 0.003;
    activityRef.current +=
      (isMoving ? 1 : 0 - activityRef.current) * Math.min(delta * 1.2, 1);

    smoothCursorRef.current.lerp(cursorWorldRef.current, 0.1);
    const cx = smoothCursorRef.current.x;
    const cy = smoothCursorRef.current.y;
    const cz = smoothCursorRef.current.z;

    const posAttr = pointsRef.current.geometry.attributes.position;
    const posArray = posAttr.array as Float32Array;
    const velArray = velocitiesRef.current;
    const lineAttr = linesRef.current.geometry.attributes.position;
    const lineArray = lineAttr.array as Float32Array;
    const activity = activityRef.current;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3;
      const px = posArray[ix];
      const py = posArray[ix + 1];
      const pz = posArray[ix + 2];
      const dx = cx - px;
      const dy = cy - py;
      const dz = cz - pz;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.001;

      if (activity > 0.01 && dist < INFLUENCE_RADIUS) {
        const force = ATTRACT_FORCE * (1 - dist / INFLUENCE_RADIUS) * activity;
        velArray[ix] += (dx / dist) * force;
        velArray[ix + 1] += (dy / dist) * force;
        velArray[ix + 2] += (dz / dist) * force;
      }

      velArray[ix] += (anchors[ix] - px) * SPRING_FORCE;
      velArray[ix + 1] += (anchors[ix + 1] - py) * SPRING_FORCE;
      velArray[ix + 2] += (anchors[ix + 2] - pz) * SPRING_FORCE;
      velArray[ix] *= DAMPING;
      velArray[ix + 1] *= DAMPING;
      velArray[ix + 2] *= DAMPING;
      posArray[ix] += velArray[ix];
      posArray[ix + 1] += velArray[ix + 1];
      posArray[ix + 2] += velArray[ix + 2];
    }
    posAttr.needsUpdate = true;

    for (let li = 0; li < connections.length; li++) {
      const [a, b] = connections[li];
      const lx = li * 6;
      lineArray[lx] = posArray[a * 3];
      lineArray[lx + 1] = posArray[a * 3 + 1];
      lineArray[lx + 2] = posArray[a * 3 + 2];
      lineArray[lx + 3] = posArray[b * 3];
      lineArray[lx + 4] = posArray[b * 3 + 1];
      lineArray[lx + 5] = posArray[b * 3 + 2];
    }
    lineAttr.needsUpdate = true;

    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0003;
    }
  });

  return (
    <group ref={groupRef}>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#4338ca" transparent opacity={0.3} depthWrite={false} />
      </lineSegments>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.1} vertexColors map={starTexture} sizeAttenuation transparent opacity={0.85} depthWrite={false} />
      </points>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Geographic globe — hero sits inside latitude/longitude rings       */
/* ------------------------------------------------------------------ */
function EnclosingSphere() {
  const globeRef = useRef<THREE.Group>(null);

  const rings = useMemo(() => {
    const result: { geo: THREE.TorusGeometry; rotation: [number, number, number]; opacity: number }[] = [];
    const R = 4.5;
    const tube = 0.015;

    // Latitude rings (horizontal, stacked)
    const latAngles = [-60, -40, -20, 0, 20, 40, 60];
    for (const deg of latAngles) {
      const rad = (deg * Math.PI) / 180;
      const r = R * Math.cos(rad);
      const y = R * Math.sin(rad);
      result.push({
        geo: new THREE.TorusGeometry(r, tube, 16, 100),
        rotation: [Math.PI / 2, 0, 0],
        opacity: deg === 0 ? 0.22 : 0.12,
      });
    }

    // Longitude rings (vertical, rotated around Y)
    const lonCount = 8;
    for (let i = 0; i < lonCount; i++) {
      const angle = (i / lonCount) * Math.PI;
      result.push({
        geo: new THREE.TorusGeometry(R, tube, 16, 100),
        rotation: [0, 0, angle],
        opacity: 0.1,
      });
    }

    return result;
  }, []);

  useFrame(({ clock }) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = clock.elapsedTime * 0.15;
      globeRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.2) * 0.2;
      globeRef.current.rotation.z = clock.elapsedTime * 0.08;
    }
  });

  return (
    <group ref={globeRef}>
      {rings.map((ring, i) => (
        <mesh key={i} rotation={ring.rotation} geometry={ring.geo}>
          <meshBasicMaterial
            color="#BBD5DA"
            transparent
            opacity={ring.opacity}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Combined light mode scene                                          */
/* ------------------------------------------------------------------ */
export function LightModeScene() {
  return (
    <>
      <EnclosingSphere />
      <Constellation />
      <FloatingShapes />
    </>
  );
}
