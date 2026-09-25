'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import type { Form } from '@/lib/gravity/superposition';

const COUNT = 2400;
const PALETTE = ['#f1ede1', '#93a294', '#d3a34c', '#e8857a', '#7fb7d9', '#9ccf8f'];

function target(form: Form | 'flat', i: number, out: THREE.Vector3): THREE.Vector3 {
  const t = i / COUNT;
  switch (form) {
    case 'flat': {
      const side = Math.ceil(Math.sqrt(COUNT));
      return out.set(((i % side) / side - 0.5) * 5, (Math.floor(i / side) / side - 0.5) * 3.2, 0);
    }
    case 'sphere': {
      const phi = Math.acos(1 - 2 * t);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      return out.setFromSphericalCoords(1.4, phi, theta);
    }
    case 'torus': {
      const u = t * Math.PI * 2 * 40;
      const v = t * Math.PI * 2;
      return out.set(
        (1.2 + 0.45 * Math.cos(u)) * Math.cos(v),
        (1.2 + 0.45 * Math.cos(u)) * Math.sin(v),
        0.45 * Math.sin(u),
      );
    }
    case 'knot': {
      const s = t * Math.PI * 2;
      const wobble = 0.12 * Math.sin(i * 12.9898);
      return out.set(
        (Math.sin(s) + 2 * Math.sin(2 * s)) * 0.5 + wobble,
        (Math.cos(s) - 2 * Math.cos(2 * s)) * 0.5 + wobble,
        -Math.sin(3 * s) * 0.5 + wobble,
      );
    }
    case 'spiral': {
      const arm = i % 3;
      const r = 0.1 + t * 2;
      const a = r * 2.4 + (arm * Math.PI * 2) / 3;
      return out.set(Math.cos(a) * r, Math.sin(a) * r, Math.sin(i) * 0.08 * (2.2 - r));
    }
    case 'wave': {
      const side = Math.ceil(Math.sqrt(COUNT));
      const x = ((i % side) / side - 0.5) * 4;
      const y = (Math.floor(i / side) / side - 0.5) * 4;
      return out.set(x, y, Math.sin(x * 2) * Math.cos(y * 2) * 0.5);
    }
    case 'lattice': {
      const n = Math.ceil(Math.cbrt(COUNT));
      return out.set(
        ((i % n) / n - 0.5) * 2.4,
        ((Math.floor(i / n) % n) / n - 0.5) * 2.4,
        (Math.floor(i / (n * n)) / n - 0.5) * 2.4,
      );
    }
  }
}

/**
 * EXPERIMENTAL spacetime mock-up: particles laid out flat (the 2D transcript) collapse through a
 * black-hole core into a 3D topology. Orbitable; not a 4D walk-in.
 */
export default function TopologyCollapse({ form, seed }: { form: Form | 'flat'; seed: string }) {
  const container = useRef<HTMLDivElement>(null);
  const formRef = useRef(form);
  const changedAt = useRef(0);

  useEffect(() => {
    formRef.current = form;
    changedAt.current = performance.now();
  }, [form]);

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, el.clientWidth / el.clientHeight, 0.1, 100);
    camera.position.set(0, -2.2, 5.2);

    const positions = new Float32Array(COUNT * 3);
    const from = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const tmp = new THREE.Vector3();
    const c = new THREE.Color();
    let h = 0;
    for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) | 0;
    for (let i = 0; i < COUNT; i += 1) {
      target('flat', i, tmp).toArray(positions, i * 3);
      c.set(PALETTE[Math.abs(h + i * 7) % PALETTE.length]).toArray(colors, i * 3);
    }
    from.set(positions);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const points = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        size: 0.035,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
      }),
    );
    scene.add(points);

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x000000 }),
    );
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.42, 0.015, 8, 96),
      new THREE.MeshBasicMaterial({ color: 0xd3a34c, transparent: true, opacity: 0.8 }),
    );
    ring.rotation.x = Math.PI / 2.4;
    scene.add(core, ring);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;

    let lastForm: Form | 'flat' = 'flat';
    let frame = 0;
    const loop = () => {
      const now = performance.now();
      if (formRef.current !== lastForm) {
        from.set(positions);
        lastForm = formRef.current;
      }
      const k = Math.min(1, (now - changedAt.current) / 2200);
      const ease = k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2;
      // Particles are pulled through the core (the "event horizon") before reaching the target.
      const pull = Math.sin(Math.PI * ease) * 0.85;
      for (let i = 0; i < COUNT; i += 1) {
        target(lastForm, i, tmp);
        const j = i * 3;
        for (let a = 0; a < 3; a += 1) {
          const v = from[j + a] + (tmp.getComponent(a) - from[j + a]) * ease;
          positions[j + a] = v * (1 - pull);
        }
      }
      geometry.attributes.position.needsUpdate = true;
      ring.rotation.z += 0.01;
      controls.update();
      renderer.render(scene, camera);
      frame = requestAnimationFrame(loop);
    };
    loop();

    const observer = new ResizeObserver(() => {
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    });
    observer.observe(el);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      geometry.dispose();
      (points.material as THREE.Material).dispose();
      core.geometry.dispose();
      (core.material as THREE.Material).dispose();
      ring.geometry.dispose();
      (ring.material as THREE.Material).dispose();
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, [seed]);

  return <div ref={container} className="h-full w-full" />;
}
