"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

import { Fluid } from "./fluid";

/**
 * Returns the height (0..~1) the metal should be pulled toward at world position
 * (x, y) — the field is centred on the origin, `PITCH` apart per bead — at time `t`.
 */
export type ShapeFn = (x: number, y: number, t: number) => number;

export type LiquidMetalProps = {
  shape: ShapeFn;
  /** Bump to send one ring out from the centre, e.g. on every spoken word. */
  pulse?: number;
  /** 0..1 live sound level; keeps the surface trembling while someone speaks. */
  level?: number;
  cols?: number;
  rows?: number;
  /** Bead spacing in world units. */
  pitch?: number;
  /** Let touches and the pointer disturb the surface. */
  interactive?: boolean;
  className?: string;
};

export const DEFAULT_COLS = 168;
export const DEFAULT_ROWS = 102;
export const DEFAULT_PITCH = 0.043;
const MAX_HEIGHT = 1.15;
/** Seconds between the stray drops that keep a resting pool alive. */
const DROP_EVERY = 1.6;

/**
 * A pool of liquid metal made of thousands of beads. Each bead sits on a wave-equation
 * surface (`Fluid`): the shape you ask for is only a target the liquid is drawn toward, so
 * every change ripples, overshoots and settles. Beads swell as they rise and slide a little
 * downhill, so ridges read as liquid rather than pins. Rendering stops when the element is
 * offscreen or the tab is hidden; under reduced motion the target is shown still.
 */
export function LiquidMetal({
  shape,
  pulse = 0,
  level = 0,
  cols = DEFAULT_COLS,
  rows = DEFAULT_ROWS,
  pitch = DEFAULT_PITCH,
  interactive = true,
  className,
}: LiquidMetalProps) {
  const container = useRef<HTMLDivElement>(null);
  const live = useRef({ shape, pulse, level });

  useEffect(() => {
    live.current = { shape, pulse, level };
  }, [shape, pulse, level]);

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environment;
    scene.environmentIntensity = 0.5;

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    const fit = () => {
      camera.aspect = Math.max(1e-3, el.clientWidth / el.clientHeight);
      const halfW = (cols * pitch) / 2;
      const halfH = (rows * pitch) / 2;
      const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const distance = Math.min(halfW / (tan * camera.aspect), halfH / tan) * 1.02;
      camera.position.set(0, -distance * 0.42, distance * 0.93);
      camera.lookAt(0, 0, 0.2);
      camera.updateProjectionMatrix();
    };
    fit();

    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(-3, -2, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xdfe7ff, 0.5);
    rim.position.set(4, 5, 2);
    scene.add(rim);

    const geometry = new THREE.IcosahedronGeometry(pitch * 0.34, 1);
    const material = new THREE.MeshStandardMaterial({
      color: 0xa9aeb6,
      metalness: 1,
      roughness: 0.18,
    });
    const beads = new THREE.InstancedMesh(geometry, material, cols * rows);
    scene.add(beads);

    const fluid = new Fluid(cols, rows);
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const scale = new THREE.Vector3();
    const rotation = new THREE.Quaternion();
    const slope: [number, number] = [0, 0];

    const fillTarget = (t: number) => {
      const fn = live.current.shape;
      for (let row = 0; row < rows; row += 1) {
        const y = (row - (rows - 1) / 2) * pitch;
        for (let col = 0; col < cols; col += 1) {
          const x = (col - (cols - 1) / 2) * pitch;
          fluid.target[row * cols + col] = Math.min(MAX_HEIGHT, fn(x, y, t));
        }
      }
    };

    const place = () => {
      const h = fluid.height;
      for (let row = 0; row < rows; row += 1) {
        const y = (row - (rows - 1) / 2) * pitch;
        for (let col = 0; col < cols; col += 1) {
          const i = row * cols + col;
          const z = Math.max(-0.4, Math.min(MAX_HEIGHT * 1.3, h[i]));
          fluid.gradient(col, row, slope);
          // Beads run a little downhill and swell as they rise: a bulge, not a pin.
          const x = (col - (cols - 1) / 2) * pitch - slope[0] * pitch * 2.2;
          const s =
            1 + Math.max(0, z) * 0.6 + Math.min(0.35, Math.hypot(slope[0], slope[1]) * 3);
          position.set(x, y - slope[1] * pitch * 2.2, z);
          scale.set(s, s, s);
          matrix.compose(position, rotation, scale);
          beads.setMatrixAt(i, matrix);
        }
      }
      beads.instanceMatrix.needsUpdate = true;
      renderer.render(scene, camera);
    };

    fillTarget(0);
    fluid.settle();
    place();

    let frame = 0;
    let running = false;
    let visible = true;
    let last = 0;
    let lastPulse = live.current.pulse;
    let nextDrop = DROP_EVERY;
    const start = performance.now() / 1000;

    const loop = (ms: number) => {
      frame = requestAnimationFrame(loop);
      const now = ms / 1000 - start;
      const dt = last ? now - last : 1 / 60;
      last = now;

      fillTarget(now);
      const { pulse: beat, level: lvl } = live.current;
      if (beat !== lastPulse) {
        lastPulse = beat;
        fluid.splash((cols - 1) / 2, (rows - 1) / 2, 4, -9);
      }
      if (lvl > 0.02) {
        // A voice keeps the pool trembling in proportion to its loudness.
        fluid.splash(
          (cols - 1) / 2 + (Math.random() - 0.5) * cols * 0.3,
          (rows - 1) / 2 + (Math.random() - 0.5) * rows * 0.3,
          3,
          -lvl * 6,
        );
      }
      if (now > nextDrop) {
        nextDrop = now + DROP_EVERY * (0.6 + Math.random());
        fluid.splash(Math.random() * cols, Math.random() * rows, 2.5, -2.4);
      }
      fluid.step(dt);
      place();
    };

    const sync = () => {
      const should = visible && !document.hidden && !reduced.matches;
      if (should && !running) {
        running = true;
        last = 0;
        frame = requestAnimationFrame(loop);
      } else if (!should && running) {
        running = false;
        cancelAnimationFrame(frame);
        if (reduced.matches) {
          fillTarget(0);
          fluid.settle();
          place();
        }
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", sync);
    sync();

    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();
    let lastX = NaN;
    let lastY = NaN;
    const touch = (event: PointerEvent, force: number) => {
      const rect = el.getBoundingClientRect();
      ndc.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(ndc, camera);
      if (!raycaster.ray.intersectPlane(plane, hit)) return;
      const cx = hit.x / pitch + (cols - 1) / 2;
      const cy = hit.y / pitch + (rows - 1) / 2;
      const moved = Number.isNaN(lastX) ? 1 : Math.hypot(cx - lastX, cy - lastY);
      lastX = cx;
      lastY = cy;
      fluid.splash(cx, cy, 3.2, -force * Math.min(1, moved / 3 + 0.25));
    };
    const onMove = (event: PointerEvent) => touch(event, 5);
    const onDown = (event: PointerEvent) => touch(event, 14);
    const onLeave = () => {
      lastX = NaN;
      lastY = NaN;
    };
    if (interactive) {
      el.addEventListener("pointermove", onMove, { passive: true });
      el.addEventListener("pointerdown", onDown, { passive: true });
      el.addEventListener("pointerleave", onLeave);
    }

    const ro = new ResizeObserver(() => {
      renderer.setSize(el.clientWidth, el.clientHeight);
      fit();
      if (!running) place();
    });
    ro.observe(el);

    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", sync);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerleave", onLeave);
      geometry.dispose();
      material.dispose();
      beads.dispose();
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, [cols, rows, pitch, interactive]);

  return (
    <div ref={container} aria-hidden="true" className={className ?? "h-full w-full"} />
  );
}
