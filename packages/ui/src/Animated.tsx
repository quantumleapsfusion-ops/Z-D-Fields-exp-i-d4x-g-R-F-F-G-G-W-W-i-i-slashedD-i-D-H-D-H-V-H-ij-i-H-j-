"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

type AnimatedProps = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  "aria-hidden"?: boolean;
};

/**
 * Pauses every CSS animation inside it while it is off screen or the tab is hidden via the
 * `[data-animation="paused"]` rule in tokens.css. Wrap decorative motion (orbitals,
 * waveforms, rings) in it.
 */
export function Animated({
  as: Tag = "div",
  className,
  children,
  ...rest
}: AnimatedProps) {
  const ref = useRef<HTMLElement>(null);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let visible = true;
    const update = () => setRunning(visible && document.visibilityState === "visible");

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return (
    <Tag
      ref={ref}
      className={className}
      data-animation={running ? "running" : "paused"}
      {...rest}
    >
      {children}
    </Tag>
  );
}
