'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * A short demo Voice Stream: a scripted, word-timestamped transcript that plays
 * itself back so a first-time visitor understands e1-4 without reading a manual.
 * No audio is fetched; timing is simulated. Real streams use the same word-level
 * timestamps from the transcriber.
 */

type Word = { t: number; w: string };
type Entry = { label: string; words: Word[] };

const SCRIPT: Entry[] = [
  {
    label: 'Today, 07:42',
    words: timed(
      0,
      'Say hello to earth. This is my voice stream, one long recording I can pause and pick up whenever I like.',
    ),
  },
  {
    label: 'Today, 12:15',
    words: timed(9.5, 'No typing. I just talk, and the words appear as I say them.'),
  },
  {
    label: 'Yesterday, 21:03',
    words: timed(
      15,
      'Share a minute of it with a friend, or with the whole world, and they hear it in their own language.',
    ),
  },
];

const TOTAL = 23;

function timed(start: number, text: string): Word[] {
  const parts = text.split(' ');
  return parts.map((w, i) => ({
    t: start + i * 0.32 + (w.endsWith('.') || w.endsWith(',') ? 0.1 : 0),
    w,
  }));
}

export function DemoStream({ className }: { className?: string }) {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(true);
  const raf = useRef<number | undefined>(undefined);
  const last = useRef<number | undefined>(undefined);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setPlaying(false);
      setTime(TOTAL);
    }
  }, []);

  useEffect(() => {
    if (!playing) {
      last.current = undefined;
      return;
    }
    const step = (now: number) => {
      if (last.current !== undefined) {
        const dt = (now - last.current) / 1000;
        setTime((t) => (t + dt) % TOTAL);
      }
      last.current = now;
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [playing]);

  const active = useMemo(() => {
    for (let i = SCRIPT.length - 1; i >= 0; i--) {
      if (time >= SCRIPT[i].words[0].t) return i;
    }
    return 0;
  }, [time]);

  return (
    <section aria-label="Demo Voice Stream" className={className}>
      <div className="flex items-center justify-between">
        <p className="label">Demo Voice Stream</p>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-pressed={playing}
          className="rounded-full border border-chalk/20 px-3 py-1 font-sans text-xs text-chalk/80 transition-colors hover:border-chalk"
        >
          {playing ? 'Pause' : 'Play'}
        </button>
      </div>

      <div className="mt-3 h-0.5 w-full overflow-hidden rounded-full bg-chalk/10">
        <div className="spectrum-bar h-full" style={{ width: `${(time / TOTAL) * 100}%` }} />
      </div>

      <ol className="mt-6 space-y-8">
        {SCRIPT.map((entry, i) => (
          <li key={entry.label} className={i === active ? '' : 'opacity-40'}>
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className={`h-2 w-2 rounded-full ${i === active && playing ? 'spectrum-bar' : 'bg-chalk/30'}`}
              />
              <span className="label">{entry.label}</span>
            </div>
            <p className="mt-2 font-sans text-lg leading-relaxed sm:text-xl">
              {entry.words.map((word, j) => {
                const said = time >= word.t;
                const current = said && (entry.words[j + 1] ? time < entry.words[j + 1].t : true);
                return (
                  <span
                    key={j}
                    className={`inline-block transition-all duration-200 ${
                      said
                        ? 'translate-y-0 text-chalk opacity-100'
                        : 'translate-y-[0.15em] text-dust opacity-50'
                    } ${current && i === active ? 'scale-105' : ''}`}
                  >
                    {word.w}
                    {j < entry.words.length - 1 ? '\u00A0' : ''}
                  </span>
                );
              })}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
