import Image from 'next/image';

type LogoProps = {
  /** Height in px. Minimum per brand guide: 24. */
  size?: number;
  className?: string;
  title?: string;
  priority?: boolean;
};

/** The Ψπ mark from /brand/logo (raster; never redrawn or recoloured). */
export function Logo({ size = 32, className, title = 'e1-4', priority }: LogoProps) {
  const src = size > 256 ? '/brand/e1-4_mark_1024.png' : '/brand/e1-4_mark_512.png';
  return (
    <Image
      src={src}
      alt={title}
      width={size}
      height={size}
      priority={priority}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}

type LockupProps = {
  /** Rendered width in px. Minimum per brand guide: 160. */
  width?: number;
  className?: string;
  priority?: boolean;
};

/**
 * Full lockup (mark, wordmark, rule, tagline). Renders the light-background
 * file by default and swaps to the dark-background file in dark mode.
 */
export function Lockup({ width = 320, className, priority }: LockupProps) {
  const height = Math.round((width * 528) / 1280);
  return (
    <span
      className={`inline-block ${className ?? ''}`}
      style={{ width, height }}
      role="img"
      aria-label="e1-4 — earth life-forms"
    >
      <Image
        src="/brand/e1-4_lockup_light.png"
        alt=""
        width={width}
        height={height}
        priority={priority}
        className="block dark:hidden"
        style={{ width, height }}
      />
      <Image
        src="/brand/e1-4_lockup_dark.png"
        alt=""
        width={width}
        height={height}
        priority={priority}
        className="hidden dark:block"
        style={{ width, height }}
      />
    </span>
  );
}

/** The tagline set as a heading: e, l and f in bold, the rest regular. */
export function Tagline({ className }: { className?: string }) {
  return (
    <span className={`font-display tracking-display ${className ?? ''}`}>
      <b className="font-bold">e</b>arth <b className="font-bold">l</b>ife-
      <b className="font-bold">f</b>orms
    </span>
  );
}
