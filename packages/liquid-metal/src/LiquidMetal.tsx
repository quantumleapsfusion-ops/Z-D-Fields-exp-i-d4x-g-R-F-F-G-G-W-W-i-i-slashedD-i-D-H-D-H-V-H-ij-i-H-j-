"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

import { runFlat } from "./flat";
import { Fluid } from "./fluid";

/**
 * Returns the height (0..~1) the metal should be pulled toward at world position
 * (x, y) — the field is centred on the origin, `PITCH` apart per bead — at time `t`.
 * `u`/`v` are the same position normalised to 0..1 across the whole grid.
 */
export type ShapeFn = (x: number, y: number, t: number, u: number, v: number) => number;

/**
 * Colours a bead at world position (x, y): writes an sRGB colour (0..1) into `out` and returns how
 * much of it to use, 0 leaving the bead plain metal and 1 fully coloured.
 */
export type TintFn = (x: number, y: number, out: [number, number, number]) => number;

/** How the device leans, each axis in -1..1: `x` as the right edge dips, `y` as the top dips. */
export type Tilt = { x: number; y: number };

export type LiquidMetalProps = {
  shape: ShapeFn;
  /** Colour some beads, e.g. so the metal draws a coloured mark. */
  tint?: TintFn;
  /** Subscribe to device lean; the metal pools toward the low side and the field leans with it. */
  tilt?: (onTilt: (tilt: Tilt) => void) => () => void;
  /** Swap `cols`/`rows` when the element is taller than wide so the pool stays tall enough. */
  autoOrient?: boolean;
  /** Stretch the field past the viewport edges so it always covers the screen. */
  cover?: boolean;
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
/** Margin past the screen edges so leaning never shows the end of the field. */
const COVER = 1.12;
/** How far the metal pools toward the low side when tilted. */
const POOL = 0.16;
/** How far the whole field leans with the device, in radians. */
const LEAN = 0.18;

/**
 * A pool of liquid metal made of thousands of beads. Each bead sits on a wave-equation
 * surface (`Fluid`): the shape you ask for is only a target the liquid is drawn toward, so
 * every change ripples, overshoots and settles. Beads swell as they rise and slide a little
 * downhill, so ridges read as liquid rather than pins. Rendering stops when the element is
 * offscreen or the tab is hidden; under reduced motion the target is shown still.
 */
export function LiquidMetal({
  shape,
  tint,
  tilt: watchTilt,
  autoOrient = false,
  cover = false,
  pulse = 0,
  level = 0,
  cols: colsProp = DEFAULT_COLS,
  rows: rowsProp = DEFAULT_ROWS,
  pitch = DEFAULT_PITCH,
  interactive = true,
  className,
}: LiquidMetalProps) {
  const container = useRef<HTMLDivElement>(null);
  const live = useRef({ shape, tint, pulse, level });

  useEffect(() => {
    live.current = { shape, tint, pulse, level };
  }, [shape, tint, pulse, level]);

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const portrait = autoOrient && el.clientHeight > el.clientWidth;
    const cols = portrait ? Math.min(colsProp, rowsProp) : Math.max(colsProp, rowsProp);
    const rows = portrait ? Math.max(colsProp, rowsProp) : Math.min(colsProp, rowsProp);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      // No WebGL here (blocked, unsupported or out of contexts): draw the same liquid in 2D.
      return runFlat(el, live, cols, rows, pitch, DEFAULT_PITCH / pitch);
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    el.appendChild(renderer.domElement);
    let stopFlat: (() => void) | null = null;
    const onLost = (event: Event) => {
      // The GPU dropped the context (common on phones under load): carry on in 2D.
      event.preventDefault();
      if (stopFlat) return;
      running = false;
      cancelAnimationFrame(frame);
      renderer.domElement.style.display = "none";
      stopFlat = runFlat(el, live, cols, rows, pitch, DEFAULT_PITCH / pitch);
    };
    renderer.domElement.addEventListener("webglcontextlost", onLost);

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
      camera.updateMatrixWorld();
      if (!cover) return;
      let reachX = 0;
      let reachY = 0;
      for (const [sx, sy] of [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ]) {
        corner.set(sx, sy, 0.5).unproject(camera).sub(camera.position);
        if (corner.z >= 0) continue;
        const t = -camera.position.z / corner.z;
        reachX = Math.max(reachX, Math.abs(camera.position.x + corner.x * t));
        reachY = Math.max(reachY, Math.abs(camera.position.y + corner.y * t));
      }
      beads.scale.set(
        Math.max(1, (reachX * COVER) / halfW),
        Math.max(1, (reachY * COVER) / halfH),
        1,
      );
    };

    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(-3, -2, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xdfe7ff, 0.5);
    rim.position.set(4, 5, 2);
    scene.add(rim);

    const geometry = new THREE.IcosahedronGeometry(pitch * 0.34, 1);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 1,
      roughness: 0.18,
    });
    const beads = new THREE.InstancedMesh(geometry, material, cols * rows);
    scene.add(beads);
    const corner = new THREE.Vector3();
    fit();

    const tilt: Tilt = { x: 0, y: 0 };
    const lean: Tilt = { x: 0, y: 0 };
    const stopTilt = watchTilt?.((next) => {
      tilt.x = next.x;
      tilt.y = next.y;
    });

    const fluid = new Fluid(cols, rows);
    // Waves and splashes are tuned in cells at the default pitch; keep them the same size in the world.
    const cellsPerDefault = DEFAULT_PITCH / pitch;
    fluid.waveSpeed *= cellsPerDefault;
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const scale = new THREE.Vector3();
    const rotation = new THREE.Quaternion();
    const slope: [number, number] = [0, 0];

    const plain = new THREE.Color(0xa9aeb6);
    const color = new THREE.Color();
    const mark = new THREE.Color();
    const rgb: [number, number, number] = [0, 0, 0];
    let painted: TintFn | undefined | null = null;
    const paint = () => {
      const fn = live.current.tint;
      if (fn === painted) return;
      painted = fn;
      for (let row = 0; row < rows; row += 1) {
        const y = (row - (rows - 1) / 2) * pitch;
        for (let col = 0; col < cols; col += 1) {
          const x = (col - (cols - 1) / 2) * pitch;
          const amount = fn ? Math.max(0, Math.min(1, fn(x, y, rgb))) : 0;
          color.copy(plain);
          if (amount > 0) {
            color.lerp(mark.setRGB(rgb[0], rgb[1], rgb[2], THREE.SRGBColorSpace), amount);
          }
          beads.setColorAt(row * cols + col, color);
        }
      }
      if (beads.instanceColor) beads.instanceColor.needsUpdate = true;
    };

    const fillTarget = (t: number) => {
      const fn = live.current.shape;
      for (let row = 0; row < rows; row += 1) {
        const y = (row - (rows - 1) / 2) * pitch;
        for (let col = 0; col < cols; col += 1) {
          const x = (col - (cols - 1) / 2) * pitch;
          const pool = (x * lean.x + y * lean.y) * POOL;
          fluid.target[row * cols + col] = Math.max(
            0,
            Math.min(MAX_HEIGHT, fn(x, y, t, col / cols, row / rows) + pool),
          );
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
          slope[0] *= cellsPerDefault;
          slope[1] *= cellsPerDefault;
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
      paint();
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

      lean.x += (tilt.x - lean.x) * 0.08;
      lean.y += (tilt.y - lean.y) * 0.08;
      beads.rotation.set(-lean.y * LEAN, lean.x * LEAN, 0);
      fillTarget(now);
      const { pulse: beat, level: lvl } = live.current;
      if (beat !== lastPulse) {
        lastPulse = beat;
        fluid.splash((cols - 1) / 2, (rows - 1) / 2, 4 * cellsPerDefault, -9);
      }
      if (lvl > 0.02) {
        // A voice keeps the pool trembling in proportion to its loudness.
        fluid.splash(
          (cols - 1) / 2 + (Math.random() - 0.5) * cols * 0.3,
          (rows - 1) / 2 + (Math.random() - 0.5) * rows * 0.3,
          3 * cellsPerDefault,
          -lvl * 6,
        );
      }
      if (now > nextDrop) {
        nextDrop = now + DROP_EVERY * (0.6 + Math.random());
        fluid.splash(
          Math.random() * cols,
          Math.random() * rows,
          2.5 * cellsPerDefault,
          -2.4,
        );
      }
      fluid.step(dt);
      place();
    };

    const sync = () => {
      if (stopFlat) return;
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
      const cx = hit.x / beads.scale.x / pitch + (cols - 1) / 2;
      const cy = hit.y / beads.scale.y / pitch + (rows - 1) / 2;
      const moved = Number.isNaN(lastX) ? 1 : Math.hypot(cx - lastX, cy - lastY);
      lastX = cx;
      lastY = cy;
      fluid.splash(
        cx,
        cy,
        3.2 * cellsPerDefault,
        -force * Math.min(1, moved / 3 / cellsPerDefault + 0.25),
      );
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
      stopFlat?.();
      renderer.domElement.removeEventListener("webglcontextlost", onLost);
      stopTilt?.();
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
  }, [colsProp, rowsProp, pitch, interactive, autoOrient, cover, watchTilt]);

  return (
    <div ref={container} aria-hidden="true" className={className ?? "h-full w-full"} />
  );
}
