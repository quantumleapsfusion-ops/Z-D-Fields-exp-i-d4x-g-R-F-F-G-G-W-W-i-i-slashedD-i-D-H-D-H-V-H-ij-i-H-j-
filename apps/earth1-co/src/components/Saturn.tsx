"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

const RINGS = [
  { r: 1.26, w: 0.2, o: 0.12, c: "#8f8472" },
  { r: 1.47, w: 0.2, o: 0.22, c: "#a89a80" },
  { r: 1.62, w: 0.16, o: 0.62, c: "#e9dcc0" },
  { r: 1.8, w: 0.2, o: 0.8, c: "#f4e8cc" },
  { r: 2.1, w: 0.14, o: 0.5, c: "#d8c8a6" },
  { r: 2.23, w: 0.07, o: 0.42, c: "#cbb996" },
  { r: 2.34, w: 0.012, o: 0.7, c: "#f6efe0" },
];

const BANDS = [
  { y: -86, h: 16, c: "#c9b58c", o: 0.5 },
  { y: -58, h: 20, c: "#b99b68", o: 0.45 },
  { y: -30, h: 14, c: "#e8d7b0", o: 0.5 },
  { y: -8, h: 22, c: "#a8875a", o: 0.4 },
  { y: 22, h: 14, c: "#e2cfa4", o: 0.45 },
  { y: 44, h: 18, c: "#b39468", o: 0.4 },
  { y: 70, h: 20, c: "#8c7452", o: 0.4 },
];

function Rings({ clip }: { clip: string }) {
  return (
    <g clipPath={`url(#${clip})`}>
      {RINGS.map((ring) => (
        <circle
          key={ring.r}
          r={ring.r * 100}
          fill="none"
          stroke={ring.c}
          strokeWidth={ring.w * 100}
          opacity={ring.o}
        />
      ))}
    </g>
  );
}

/** Saturn with its A, B and C rings and the Cassini gap. It tilts toward the cursor or finger. */
export function Saturn({ className }: { className?: string }) {
  const px = useSpring(0, { stiffness: 40, damping: 14 });
  const py = useSpring(0, { stiffness: 40, damping: 14 });
  const rotate = useTransform(px, (v) => -18 + v * 12);
  const open = useTransform(py, (v) => 0.26 - v * 0.1);

  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      px.set((event.clientX / window.innerWidth) * 2 - 1);
      py.set((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => window.removeEventListener("pointermove", onPointer);
  }, [px, py]);

  return (
    <svg
      viewBox="-260 -150 520 300"
      overflow="visible"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <radialGradient id="saturn-body" cx="0.38" cy="0.32" r="0.75">
          <stop offset="0" stopColor="#f6ead0" />
          <stop offset="0.6" stopColor="#d2b582" />
          <stop offset="1" stopColor="#6d5634" />
        </radialGradient>
        <radialGradient id="saturn-night" cx="0.2" cy="0.15" r="1">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.85" />
        </radialGradient>
        <radialGradient id="saturn-glow" r="0.5">
          <stop offset="0" stopColor="#ffd9a0" stopOpacity="0.25" />
          <stop offset="1" stopColor="#ffd9a0" stopOpacity="0" />
        </radialGradient>
        <clipPath id="saturn-disc">
          <circle r="100" />
        </clipPath>
        <clipPath id="saturn-back">
          <rect x="-300" y="-300" width="600" height="300" />
        </clipPath>
        <clipPath id="saturn-front">
          <rect x="-300" y="0" width="600" height="300" />
        </clipPath>
      </defs>
      <circle r="150" fill="url(#saturn-glow)" />
      <motion.g style={{ rotate }}>
        <motion.g style={{ scaleY: open }}>
          <Rings clip="saturn-back" />
        </motion.g>
        <g>
          <circle r="100" fill="url(#saturn-body)" />
          <g clipPath="url(#saturn-disc)">
            {BANDS.map((band) => (
              <rect
                key={band.y}
                x="-110"
                y={band.y}
                width="220"
                height={band.h}
                fill={band.c}
                opacity={band.o}
              />
            ))}
            <ellipse cy="10" rx="130" ry="10" fill="#000" opacity="0.28" />
          </g>
          <circle r="100" fill="url(#saturn-night)" />
        </g>
        <motion.g style={{ scaleY: open }}>
          <Rings clip="saturn-front" />
        </motion.g>
      </motion.g>
    </svg>
  );
}
