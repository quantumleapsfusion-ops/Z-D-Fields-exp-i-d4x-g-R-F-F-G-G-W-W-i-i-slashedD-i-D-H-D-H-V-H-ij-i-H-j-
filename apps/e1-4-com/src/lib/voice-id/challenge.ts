/**
 * Spoken one-time phrases. A voiceprint alone can be replayed from a recording, so sign-in also
 * asks for a fresh random phrase that an old clip cannot contain.
 */
export const CHALLENGE_WORDS = [
  "amber",
  "anchor",
  "atlas",
  "bamboo",
  "beacon",
  "bridge",
  "canyon",
  "cedar",
  "comet",
  "copper",
  "coral",
  "cricket",
  "delta",
  "ember",
  "falcon",
  "feather",
  "forest",
  "galaxy",
  "garden",
  "glacier",
  "harbor",
  "island",
  "lantern",
  "lemon",
  "maple",
  "meadow",
  "meteor",
  "mirror",
  "nebula",
  "ocean",
  "orbit",
  "orchid",
  "pebble",
  "pepper",
  "planet",
  "prism",
  "quartz",
  "rabbit",
  "raven",
  "river",
  "saddle",
  "silver",
  "sparrow",
  "spruce",
  "summit",
  "thunder",
  "timber",
  "tulip",
  "valley",
  "velvet",
  "violet",
  "walnut",
  "willow",
  "window",
  "winter",
  "zebra",
] as const;

export const CHALLENGE_LENGTH = 4;
export const CHALLENGE_TTL_MS = 2 * 60 * 1000;

export function makePhrase(
  length = CHALLENGE_LENGTH,
  randomInt: (max: number) => number = secureRandomInt,
): string {
  const words: string[] = [];
  while (words.length < length) {
    const word = CHALLENGE_WORDS[randomInt(CHALLENGE_WORDS.length)];
    if (!words.includes(word)) words.push(word);
  }
  return words.join(" ");
}

function secureRandomInt(max: number): number {
  const limit = Math.floor(0x1_0000_0000 / max) * max;
  const buf = new Uint32Array(1);
  do crypto.getRandomValues(buf);
  while (buf[0] >= limit);
  return buf[0] % max;
}

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const next = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      prev = row[j];
      row[j] = next;
    }
  }
  return row[b.length];
}

/**
 * True when every challenge word was heard. Order and filler words are ignored, and a single
 * transcription slip is tolerated in words of five letters or more ("sparow" for "sparrow").
 */
export function phraseMatches(expected: string, heard: string): boolean {
  const said = tokens(heard);
  return tokens(expected).every((word) =>
    said.some((w) => w === word || (word.length >= 5 && editDistance(w, word) <= 1)),
  );
}
