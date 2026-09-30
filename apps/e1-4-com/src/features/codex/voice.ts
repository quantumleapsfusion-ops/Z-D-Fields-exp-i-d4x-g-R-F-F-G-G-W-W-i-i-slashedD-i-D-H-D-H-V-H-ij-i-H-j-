"use client";

const WORD_MS = 330;

const FEMALE =
  /samantha|ava|allison|susan|victoria|karen|moira|tessa|fiona|serena|zira|aria|jenny|libby|sonia|female|woman|google us english|google uk english female/i;

/** Da Vinci's voice: a light, warm female English voice, preferring ones that run on the device. */
export function pickVoice(
  voices: SpeechSynthesisVoice[] = window.speechSynthesis.getVoices(),
): SpeechSynthesisVoice | undefined {
  const english = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  return (
    english.find((v) => v.localService && FEMALE.test(v.name)) ??
    english.find((v) => FEMALE.test(v.name)) ??
    english.find((v) => v.localService) ??
    english[0] ??
    voices.find((v) => v.localService)
  );
}

/**
 * Speak lines with the device's own speech synthesiser (local voices only), calling `onLine`
 * as each starts and `onWord` on every word. Without a local voice the lines are paced silently.
 * Returns a cancel function.
 */
export function speak(
  lines: string[],
  {
    onLine,
    onWord,
    onEnd,
  }: { onLine: (index: number) => void; onWord: () => void; onEnd: () => void },
): () => void {
  let cancelled = false;
  const timers: ReturnType<typeof setTimeout>[] = [];
  const voice = "speechSynthesis" in window ? pickVoice() : undefined;

  if (!voice) {
    let at = 0;
    lines.forEach((line, index) => {
      timers.push(setTimeout(() => !cancelled && onLine(index), at));
      line.split(/\s+/).forEach((_, w) => {
        timers.push(setTimeout(() => !cancelled && onWord(), at + w * WORD_MS));
      });
      at += line.split(/\s+/).length * WORD_MS + 600;
    });
    timers.push(setTimeout(() => !cancelled && onEnd(), at));
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }

  const synth = window.speechSynthesis;
  synth.cancel();
  lines.forEach((line, index) => {
    const utterance = new SpeechSynthesisUtterance(line);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = 1.02;
    utterance.pitch = 1.3;
    utterance.onstart = () => !cancelled && onLine(index);
    utterance.onboundary = (event) => {
      if (!cancelled && event.name === "word") onWord();
    };
    if (index === lines.length - 1) {
      utterance.onend = () => !cancelled && onEnd();
      utterance.onerror = () => !cancelled && onEnd();
    }
    synth.speak(utterance);
  });
  return () => {
    cancelled = true;
    synth.cancel();
  };
}
