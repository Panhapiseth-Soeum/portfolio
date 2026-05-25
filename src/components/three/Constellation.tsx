"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 200;
const CONNECT_DISTANCE = 2.2;
const INFLUENCE_RADIUS = 3.0;
const ATTRACT_FORCE = 0.015;
const SPRING_FORCE = 0.008;
const DAMPING = 0.92;
const COLORS = ["#6366f1", "#818cf8", "#64748b", "#475569", "#334155"];

let mouseNDC = { x: 0, y: 0 };
if (typeof window !== "undefined") {
  window.addEventListener("mousemove", (e) => {
    mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });
}

export function Constellation() {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
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
        <lineBasicMaterial color="#6366f1" transparent opacity={0.1} depthWrite={false} />
      </lineSegments>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.05} vertexColors sizeAttenuation transparent opacity={0.6} depthWrite={false} />
      </points>
    </group>
  );
}
