const BARS = [0.35, 0.6, 0.9, 0.5, 1, 0.45, 0.75, 0.3, 0.85, 0.55, 0.4, 0.7, 0.25];

export function Waveform({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`flex h-10 items-center gap-[3px] sm:gap-1 ${className ?? ''}`}
    >
      {BARS.map((scale, i) => (
        <span
          key={i}
          className="w-[2px] origin-center animate-wave rounded-full bg-chalk/70 sm:w-[3px]"
          style={{
            height: `${Math.round(scale * 100)}%`,
            animationDelay: `${i * 90}ms`,
            animationDuration: `${1200 + (i % 4) * 220}ms`,
          }}
        />
      ))}
    </div>
  );
}
