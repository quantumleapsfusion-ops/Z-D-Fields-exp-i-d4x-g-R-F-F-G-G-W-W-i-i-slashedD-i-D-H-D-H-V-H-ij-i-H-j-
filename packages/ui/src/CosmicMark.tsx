import { useId } from "react";

import { brand } from "./brand";

type CosmicMarkProps = {
  size?: number;
  /** Square mark on a dark field; its background is blended away. */
  src?: string;
  className?: string;
};

const RAYS: { angle: number; color: string }[] = [
  { angle: 90, color: brand.rainbow[2] },
  { angle: 148, color: brand.rainbow[0] },
  { angle: 180, color: brand.rainbow[1] },
  { angle: 212, color: brand.rainbow[2] },
  { angle: 270, color: brand.rainbow[3] },
  { angle: 322, color: brand.rainbow[4] },
  { angle: 36, color: brand.rainbow[3] },
];

/** The Ψπ mark in its orbit: rainbow light rays, a solid and a dotted ring, and a soft glow. */
export function CosmicMark({
  size = 240,
  src = "/brand/e1-4-mark.png",
  className,
}: CosmicMarkProps) {
  const id = useId().replace(/:/g, "");
  const glyph = size * 0.78;

  return (
    <div
      aria-hidden
      className={className}
      style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
    >
      <svg
        viewBox="-100 -100 200 200"
        width={size}
        height={size}
        overflow="visible"
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        <defs>
          <radialGradient id={`${id}-glow`}>
            <stop offset="0%" stopColor="#3aa0d8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#3aa0d8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${id}-ring`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={brand.rainbow[1]} />
            <stop offset="100%" stopColor={brand.rainbow[5]} />
          </linearGradient>
          <linearGradient id={`${id}-dots`} x1="0" y1="0" x2="1" y2="0">
            {brand.rainbow.map((c, i) => (
              <stop
                key={c}
                offset={`${(i / (brand.rainbow.length - 1)) * 100}%`}
                stopColor={c}
              />
            ))}
          </linearGradient>
          {RAYS.map((ray, i) => {
            const rad = (ray.angle * Math.PI) / 180;
            return (
              <linearGradient
                key={i}
                id={`${id}-ray-${i}`}
                gradientUnits="userSpaceOnUse"
                x1={Math.cos(rad) * 52}
                y1={-Math.sin(rad) * 52}
                x2={Math.cos(rad) * 260}
                y2={-Math.sin(rad) * 260}
              >
                <stop offset="0%" stopColor={ray.color} stopOpacity="0.9" />
                <stop offset="100%" stopColor={ray.color} stopOpacity="0" />
              </linearGradient>
            );
          })}
        </defs>
        <circle r="95" fill={`url(#${id}-glow)`} />
        {RAYS.map((ray, i) => {
          const rad = (ray.angle * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={Math.cos(rad) * 52}
              y1={-Math.sin(rad) * 52}
              x2={Math.cos(rad) * 260}
              y2={-Math.sin(rad) * 260}
              stroke={`url(#${id}-ray-${i})`}
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          );
        })}
        <circle
          r="44"
          fill="none"
          stroke={`url(#${id}-ring)`}
          strokeWidth="0.7"
          opacity="0.8"
        />
        <circle
          r="50"
          fill="none"
          stroke={`url(#${id}-dots)`}
          strokeWidth="1.1"
          strokeDasharray="0.1 2.6"
          strokeLinecap="round"
        />
      </svg>
      {/* eslint-disable-next-line @next/next/no-img-element -- shared package, no next/image dependency */}
      <img
        src={src}
        alt=""
        width={glyph}
        height={glyph}
        draggable={false}
        style={{
          position: "absolute",
          left: (size - glyph) / 2,
          top: (size - glyph) / 2,
          width: glyph,
          height: glyph,
          mixBlendMode: "screen",
          maskImage: "radial-gradient(circle, #000 42%, transparent 64%)",
          WebkitMaskImage: "radial-gradient(circle, #000 42%, transparent 64%)",
        }}
      />
    </div>
  );
}
