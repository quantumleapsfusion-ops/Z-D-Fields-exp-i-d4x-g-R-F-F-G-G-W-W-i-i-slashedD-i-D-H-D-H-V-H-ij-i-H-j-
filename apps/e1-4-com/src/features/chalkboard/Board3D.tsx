"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import type { BoardElement } from "@/lib/chalkboard/types";

/**
 * EXPERIMENTAL 3D view (Three.js). Projects the 2D board into space and, optionally, uses each
 * element's creation time as depth — a first step toward the 4D (space + time) board. Read-only.
 */
export default function Board3D({
  elements,
  timeDepth,
  until,
}: {
  elements: BoardElement[];
  timeDepth: boolean;
  until: number;
}) {
  const container = useRef<HTMLDivElement>(null);
  const objects = useRef<{ object: THREE.Object3D; createdAt: number }[]>([]);

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0e1a13");
    const camera = new THREE.PerspectiveCamera(
      50,
      el.clientWidth / el.clientHeight,
      1,
      1e6,
    );

    const bounds = new THREE.Box2();
    for (const e of elements) {
      if (e.type === "stroke" || e.type === "line") {
        for (let i = 0; i < e.points.length; i += 2)
          bounds.expandByPoint(new THREE.Vector2(e.points[i], e.points[i + 1]));
      } else if (e.type === "ellipse") {
        bounds.expandByPoint(new THREE.Vector2(e.x - e.radiusX, e.y - e.radiusY));
        bounds.expandByPoint(new THREE.Vector2(e.x + e.radiusX, e.y + e.radiusY));
      } else if (e.type === "rect") {
        bounds.expandByPoint(new THREE.Vector2(e.x, e.y));
        bounds.expandByPoint(new THREE.Vector2(e.x + e.width, e.y + e.height));
      } else {
        const label = e.type === "text" ? e.text : e.tex;
        bounds.expandByPoint(new THREE.Vector2(e.x, e.y));
        bounds.expandByPoint(
          new THREE.Vector2(e.x + label.length * e.fontSize * 0.5, e.y + e.fontSize),
        );
      }
    }
    if (bounds.isEmpty())
      bounds.set(new THREE.Vector2(-400, -300), new THREE.Vector2(400, 300));
    const center = bounds.getCenter(new THREE.Vector2());
    const extent = Math.max(
      bounds.max.x - bounds.min.x,
      bounds.max.y - bounds.min.y,
      400,
    );
    const depth = timeDepth ? extent * 0.6 : 0;
    const times = elements.map((e) => e.createdAt);
    const tMin = Math.min(...times, Date.now());
    const tSpan = Math.max(1, Math.max(...times, tMin) - tMin);
    const toZ = (t: number) => ((t - tMin) / tSpan) * depth;
    const v = (x: number, y: number, z: number) =>
      new THREE.Vector3(x - center.x, -(y - center.y), z);

    const group = new THREE.Group();
    const grid = new THREE.GridHelper(extent * 1.6, 32, 0x93a294, 0x1d2e23);
    grid.rotation.x = Math.PI / 2;
    grid.position.z = -2;
    group.add(grid);

    objects.current = [];
    for (const e of elements) {
      const z = toZ(e.createdAt);
      const material = new THREE.LineBasicMaterial({ color: e.color });
      let object: THREE.Object3D;
      if (e.type === "text" || e.type === "math") {
        const label = e.type === "text" ? e.text : e.tex;
        const font = e.type === "text" ? "Georgia, serif" : "ui-monospace, monospace";
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        const px = 64;
        ctx.font = `${px}px ${font}`;
        canvas.width = Math.ceil(ctx.measureText(label).width) + 16;
        canvas.height = px * 1.4;
        ctx.font = `${px}px ${font}`;
        ctx.fillStyle = e.color;
        ctx.textBaseline = "top";
        ctx.fillText(label, 8, px * 0.15);
        const sprite = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: new THREE.CanvasTexture(canvas),
            transparent: true,
          }),
        );
        const k = e.fontSize / px;
        sprite.scale.set(canvas.width * k, canvas.height * k, 1);
        sprite.position.copy(
          v(e.x + (canvas.width * k) / 2, e.y + (canvas.height * k) / 2, z),
        );
        object = sprite;
      } else {
        let pts: THREE.Vector3[];
        if (e.type === "rect") {
          pts = [
            v(e.x, e.y, z),
            v(e.x + e.width, e.y, z),
            v(e.x + e.width, e.y + e.height, z),
            v(e.x, e.y + e.height, z),
            v(e.x, e.y, z),
          ];
        } else if (e.type === "ellipse") {
          pts = Array.from({ length: 65 }, (_, i) => {
            const a = (i / 64) * Math.PI * 2;
            return v(e.x + Math.cos(a) * e.radiusX, e.y + Math.sin(a) * e.radiusY, z);
          });
        } else {
          pts = [];
          for (let i = 0; i < e.points.length; i += 2)
            pts.push(v(e.points[i], e.points[i + 1], z));
        }
        object = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), material);
      }
      group.add(object);
      objects.current.push({ object, createdAt: e.createdAt });
    }
    group.position.z = -depth / 2;
    scene.add(group);

    camera.position.set(extent * 0.35, -extent * 0.45, extent * 1.1);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    let frame = 0;
    const loop = () => {
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
      scene.traverse((node) => {
        if (node instanceof THREE.Line || node instanceof THREE.Sprite) {
          node.geometry.dispose();
          const mat = node.material as THREE.Material & { map?: THREE.Texture | null };
          mat.map?.dispose();
          mat.dispose();
        }
      });
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, [elements, timeDepth]);

  useEffect(() => {
    objects.current.forEach((entry) => {
      entry.object.visible = entry.createdAt <= until;
    });
  }, [until, elements, timeDepth]);

  return <div ref={container} className="h-full w-full" />;
}
