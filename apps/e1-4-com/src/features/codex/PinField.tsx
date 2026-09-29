"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

import type { Form } from "@/lib/gravity/superposition";
import { BANDS, FRAMES, type SoundPrint } from "@/lib/sound/analyse";

const COLS = 72;
const ROWS = 44;
const PITCH = 0.1;
const HISTORY = 160;
const MAX_HEIGHT = 1.1;

/** `rest` breathes, `listen` ripples out from the live level, `relief` raises the recording, `form` its shape. */
export type PinPhase = "rest" | "listen" | "relief" | "form";

function formHeight(form: Form, u: number, v: number): number {
  const r = Math.hypot(u, v);
  const a = Math.atan2(v, u);
  switch (form) {
    case "sphere":
      return Math.sqrt(Math.max(0, 1 - (r * r) / 0.55));
    case "torus":
      return Math.exp(-((r - 0.55) ** 2) / 0.02);
    case "wave":
      return 0.5 + 0.5 * Math.sin(u * 6) * Math.cos(v * 4);
    case "spiral":
      return Math.max(0, Math.cos(a * 3 - r * 14)) * Math.max(0, 1 - r);
    case "lattice":
      return Math.sin(u * 9) > 0 !== Math.sin(v * 9) > 0 ? 0.7 : 0.08;
    case "knot":
      return (
        0.5 +
        0.5 *
          Math.sin(u * 5 + Math.sin(v * 5) * 2) *
          Math.cos(v * 5 + Math.sin(u * 5) * 2)
      );
  }
}

function reliefHeight(print: SoundPrint, col: number, row: number): number {
  const frame = Math.min(FRAMES - 1, Math.floor((col / COLS) * FRAMES));
  const band = Math.min(BANDS - 1, Math.floor((row / ROWS) * BANDS));
  return print.spectrogram[frame][band] ** 2 * (0.35 + print.loudness[frame] * 0.65);
}

/**
 * A pin screen of liquid metal: thousands of silver pins that rise and fall together to show the
 * voice. Everything is driven from props held in refs so the scene is built once.
 */
export default function PinField({
  phase,
  level = 0,
  print,
  form = "sphere",
  pulse = 0,
}: {
  phase: PinPhase;
  level?: number;
  print?: SoundPrint | null;
  form?: Form;
  /** Bump to send a wave through the pins, e.g. on every spoken word. */
  pulse?: number;
}) {
  const container = useRef<HTMLDivElement>(null);
  const state = useRef({ phase, level, print, form, pulse });

  useEffect(() => {
    state.current = { phase, level, print, form, pulse };
  }, [phase, level, print, form, pulse]);

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environment;

    const camera = new THREE.PerspectiveCamera(
      38,
      el.clientWidth / el.clientHeight,
      0.1,
      100,
    );
    const fit = () => {
      camera.aspect = el.clientWidth / el.clientHeight;
      const halfW = (COLS * PITCH) / 2;
      const halfH = (ROWS * PITCH) / 2;
      const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const distance = Math.min(halfW / (tan * camera.aspect), halfH / tan) * 1.02;
      camera.position.set(0, -distance * 0.42, distance * 0.93);
      camera.lookAt(0, 0, 0.2);
      camera.updateProjectionMatrix();
    };
    fit();

    const light = new THREE.DirectionalLight(0xffffff, 1.4);
    light.position.set(-3, -2, 6);
    scene.add(light);

    const geometry = new THREE.CylinderGeometry(PITCH * 0.42, PITCH * 0.42, 1, 8);
    geometry.rotateX(Math.PI / 2);
    geometry.translate(0, 0, 0.5);
    const material = new THREE.MeshStandardMaterial({
      color: 0xcfd3d9,
      metalness: 1,
      roughness: 0.26,
    });
    const pins = new THREE.InstancedMesh(geometry, material, COLS * ROWS);
    scene.add(pins);

    const heights = new Float32Array(COLS * ROWS);
    const history = new Float32Array(HISTORY);
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const scale = new THREE.Vector3(1, 1, 1);
    const rotation = new THREE.Quaternion();
    let envelope = 0;
    let lastPulse = state.current.pulse;
    let frame = 0;

    const loop = () => {
      const now = performance.now() / 1000;
      const {
        phase: p,
        level: live,
        print: sound,
        form: shape,
        pulse: beat,
      } = state.current;
      history.copyWithin(1, 0, HISTORY - 1);
      history[0] = p === "listen" ? Math.min(1, live * 1.8) : history[0] * 0.9;
      if (beat !== lastPulse) {
        envelope = 1;
        lastPulse = beat;
      }
      envelope *= 0.94;

      for (let row = 0; row < ROWS; row += 1) {
        for (let col = 0; col < COLS; col += 1) {
          const i = row * COLS + col;
          const x = (col - (COLS - 1) / 2) * PITCH;
          const y = (row - (ROWS - 1) / 2) * PITCH;
          const r = Math.hypot(x, y);
          const breath = 0.04 + 0.03 * Math.sin(now * 0.8 + x * 1.3 + y * 0.9);
          const ripple = history[Math.min(HISTORY - 1, Math.floor(r * 34))] * 0.9;
          const speech = envelope * 0.25 * Math.max(0, Math.cos(r * 5 - now * 9));
          let target = breath;
          if (p === "listen") target = breath + ripple;
          else if (p === "relief" && sound)
            target = breath + reliefHeight(sound, col, row);
          else if (p === "form")
            target = breath + formHeight(shape, x / 2.2, y / 2.2) * 0.9;
          target = Math.min(
            MAX_HEIGHT,
            target + speech + ripple * (p === "listen" ? 0 : 0.5),
          );
          heights[i] += (target - heights[i]) * 0.09;
          position.set(x, y, 0);
          scale.set(1, 1, Math.max(0.01, heights[i]));
          matrix.compose(position, rotation, scale);
          pins.setMatrixAt(i, matrix);
        }
      }
      pins.instanceMatrix.needsUpdate = true;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(loop);
    };
    loop();

    const observer = new ResizeObserver(() => {
      renderer.setSize(el.clientWidth, el.clientHeight);
      fit();
    });
    observer.observe(el);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      geometry.dispose();
      material.dispose();
      pins.dispose();
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={container} aria-hidden="true" className="h-full w-full" />;
}
