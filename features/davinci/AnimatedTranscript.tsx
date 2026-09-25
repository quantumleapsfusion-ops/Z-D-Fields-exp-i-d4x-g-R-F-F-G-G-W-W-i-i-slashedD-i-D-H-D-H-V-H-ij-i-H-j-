'use client';

import type { FinalPhrase } from '@/features/live/useLiveTranscription';

type Tone = 'question' | 'exclaim' | 'quote' | 'plain';

function toneOf(text: string): Tone {
  const t = text.trim();
  if (t.endsWith('?')) return 'question';
  if (t.endsWith('!')) return 'exclaim';
  if (/^["“].*["”]$/.test(t)) return 'quote';
  return 'plain';
}

const TONE_CLASS: Record<Tone, string> = {
  question: 'italic text-chalk',
  exclaim: 'text-ochre',
  quote: 'italic text-dust',
  plain: 'text-chalk',
};

function wordClass(word: string): string {
  if (/^\d[\d.,:%]*$/.test(word.replace(/[^\w.,:%]/g, ''))) return 'font-mono text-ochre';
  if (word.length > 3 && word === word.toUpperCase() && /[A-Z]/.test(word)) {
    return 'font-semibold tracking-wide';
  }
  if (word.replace(/\W/g, '').length >= 11)
    return 'text-chalk underline decoration-ochre/40 underline-offset-4';
  return '';
}

/**
 * Live transcription rendered as typography rather than captions: every word inks in, tone shapes
 * the type (questions lean, exclamations warm to ochre, numbers set in mono), and older phrases
 * recede as new ones arrive.
 */
export function AnimatedTranscript({
  phrases,
  interim,
}: {
  phrases: FinalPhrase[];
  interim: string;
}) {
  const recent = phrases.slice(-8);

  return (
    <div
      aria-live="polite"
      className="flex min-h-[16rem] flex-col justify-end gap-3 overflow-hidden"
    >
      {recent.length === 0 && !interim ? (
        <p className="font-display text-2xl text-dust/70">Start speaking — or type below.</p>
      ) : null}
      {recent.map((phrase, i) => {
        const age = recent.length - 1 - i;
        const tone = toneOf(phrase.text);
        const size =
          age === 0
            ? tone === 'exclaim'
              ? 'text-4xl sm:text-5xl'
              : 'text-3xl sm:text-4xl'
            : age === 1
              ? 'text-2xl'
              : 'text-lg';
        return (
          <p
            key={phrase.id}
            className={`font-display leading-snug transition-all duration-700 ${size} ${TONE_CLASS[tone]}`}
            style={{ opacity: Math.max(0.18, 1 - age * 0.16) }}
          >
            {phrase.text.split(/\s+/).map((word, w) => (
              <span
                key={`${phrase.id}-${w}`}
                className={`inline-block animate-ink-in pr-[0.28em] ${wordClass(word)}`}
                style={{ animationDelay: age === 0 ? `${w * 55}ms` : '0ms' }}
              >
                {word}
              </span>
            ))}
          </p>
        );
      })}
      {interim ? (
        <p className="animate-shimmer font-display text-2xl italic text-dust">{interim}</p>
      ) : null}
    </div>
  );
}
