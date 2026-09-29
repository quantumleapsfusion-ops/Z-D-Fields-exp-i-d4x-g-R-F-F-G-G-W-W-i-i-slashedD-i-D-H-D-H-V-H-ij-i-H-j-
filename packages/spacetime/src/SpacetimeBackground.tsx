"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { screenToSheet, type Well } from "./geometry";
import { createSpacetimeRenderer, MAX_RIPPLES, RIPPLE_LIFE_S } from "./renderer";
import { readSpacetimeAmplitude } from "./signal";
import { StaticSpacetime } from "./StaticSpacetime";
import { resolveTheme, type SpacetimePalette, type SpacetimeTheme } from "./themes";

export type SpacetimeBackgroundProps = {
  theme: SpacetimeTheme;
  /** e1-4 line colour. Ignored by the earth1 theme, which always uses `cosmos`. */
  palette?: SpacetimePalette;
};

const MAX_DPR = 1.5;
/** The top of the viewport looks past the horizon; anchor wells no higher than this (NDC). */
const MAX_WELL_NDC_Y = 0.8;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const prefersReducedMotion = () => window.matchMedia(REDUCED_MOTION).matches;

let webgl: boolean | undefined;
/** One-off probe: can this browser build the grid shaders at all? */
function supportsWebGL() {
  if (webgl === undefined) {
    const canvas = document.createElement("canvas");
    const probe = createSpacetimeRenderer(canvas, resolveTheme("e1-4"));
    webgl = probe !== null;
    probe?.dispose();
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  }
  return webgl;
}
const noop = () => () => {};

/**
 * Fixed, full-viewport deep-space backdrop with a polar spacetime grid, painted behind every
 * other element. It never takes pointer events; it observes the window's pointer so the cursor or
 * finger bends the sheet and a tap sends a ripple. The earth1 theme bends the grid into a
 * permanent well behind `[data-spacetime-singularity]`, with rainbow rays and orbit rings. With the e1-4 theme it also ripples with `setSpacetimeAmplitude` while a recording
 * feeds it.
 */
export function SpacetimeBackground({
  theme,
  palette = "cosmos",
}: SpacetimeBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [contextLost, setContextLost] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    prefersReducedMotion,
    () => false,
  );
  const hasWebGL = useSyncExternalStore(noop, supportsWebGL, () => true);
  const isStatic = reducedMotion || !hasWebGL || contextLost;
  const resolved = resolveTheme(theme, palette);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isStatic) return;
    const renderer = createSpacetimeRenderer(canvas, resolved);
    if (!renderer) return;

    let dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    let width = 0;
    let height = 0;
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      renderer.resize(Math.round(width * dpr), Math.round(height * dpr));
    };
    resize();

    const aspect = () => width / Math.max(1, height);
    const toSheet = (clientX: number, clientY: number) =>
      screenToSheet(
        (clientX / width) * 2 - 1,
        Math.min(MAX_WELL_NDC_Y, 1 - (clientY / height) * 2),
        aspect(),
      );

    const pointer = { x: 0, z: 0, target: 0, mass: 0 };
    const ripples: [number, number, number][] = [];
    let singularity: [number, number] | null = null;
    let singularityPx: [number, number, number] | null = null;
    const start = performance.now();
    const now = () => (performance.now() - start) / 1000;

    const locateSingularity = () => {
      const spec = resolved.singularity;
      if (!spec) return;
      const el = document.querySelector(spec.selector);
      const rect = el?.getBoundingClientRect();
      const cx = rect ? rect.left + rect.width / 2 : width / 2;
      const cy = rect ? rect.top + rect.height / 2 : height * 0.35;
      const radius = rect ? Math.max(rect.width, rect.height) / 2 : 56;
      singularity = toSheet(cx, cy);
      singularityPx = cy + radius * 8 > 0 ? [cx * dpr, cy * dpr, radius * dpr] : null;
    };
    locateSingularity();

    const onMove = (e: PointerEvent) => {
      const p = toSheet(e.clientX, e.clientY);
      if (!p) return;
      pointer.x = p[0];
      pointer.z = p[1];
      pointer.target = 1;
    };
    const onLeave = (e: PointerEvent) => {
      if (e.type === "pointerout" && e.relatedTarget) return;
      pointer.target = 0;
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") pointer.target = 0;
    };
    const onDown = (e: PointerEvent) => {
      onMove(e);
      const p = toSheet(e.clientX, e.clientY);
      if (!p) return;
      ripples.push([p[0], p[1], now()]);
      if (ripples.length > MAX_RIPPLES) ripples.shift();
    };
    const onResize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      resize();
      locateSingularity();
    };
    const onLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onLeave, { passive: true });
    document.documentElement.addEventListener("pointerout", onLeave, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", locateSingularity, { passive: true });
    canvas.addEventListener("webglcontextlost", onLost);
    const relocate = window.setInterval(locateSingularity, 1000);

    let voice = 0;
    let last = now();
    let slowFrames = 0;
    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      const t = now();
      const dt = Math.min(0.1, t - last);
      last = t;

      // Hold 60fps on weak GPUs by rendering fewer pixels rather than dropping frames.
      slowFrames = dt > 1 / 45 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
      if (slowFrames > 30 && dpr > 0.75) {
        dpr = Math.max(0.75, dpr - 0.25);
        slowFrames = 0;
        resize();
      }

      pointer.mass += (pointer.target - pointer.mass) * Math.min(1, dt * 4);
      const target = resolved.voice ? readSpacetimeAmplitude() : 0;
      voice += (target - voice) * Math.min(1, dt * (target > voice ? 18 : 4));
      while (ripples.length && t - ripples[0][2] > RIPPLE_LIFE_S) ripples.shift();

      const wells: Well[] = [];
      const spec = resolved.singularity;
      if (spec && singularity) wells.push([...singularity, spec.mass, spec.radius]);
      if (pointer.mass > 0.001)
        wells.push([pointer.x, pointer.z, resolved.pointerMass * pointer.mass, 1.1]);

      renderer.render({
        time: t,
        centre: singularity ?? toSheet(width / 2, height / 2) ?? [0, -3],
        singularity: singularityPx,
        wells,
        ripples: ripples.map(([x, z, born]) => [x, z, t - born, 0.35]),
        voice,
        voiceOrigin: toSheet(width / 2, height * 0.62) ?? [0, 0],
      });
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(relocate);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onLeave);
      document.documentElement.removeEventListener("pointerout", onLeave);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", locateSingularity);
      canvas.removeEventListener("webglcontextlost", onLost);
      renderer.dispose();
    };
    // `resolved` is derived from these two props.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, palette, isStatic]);

  return (
    <div
      aria-hidden="true"
      data-spacetime={theme}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        background: "#06081a",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: isStatic ? "none" : "block",
          width: "100%",
          height: "100%",
        }}
      />
      {isStatic && <StaticSpacetime theme={resolved} />}
    </div>
  );
}
