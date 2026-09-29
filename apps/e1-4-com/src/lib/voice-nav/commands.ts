export type VoiceCommand =
  | { kind: "go"; href: string; label: string }
  | { kind: "back" }
  | { kind: "signOut" }
  | { kind: "help" };

export type Destination = { href: string; label: string; phrases: string[] };

/** Spoken names for every place in the app. The longest phrase heard wins. */
export const DESTINATIONS: Destination[] = [
  {
    href: "/stream",
    label: "Voice Stream",
    phrases: ["voice stream", "stream", "streams", "diary", "recording", "record"],
  },
  {
    href: "/davinci",
    label: "Da Vinci",
    phrases: ["da vinci", "davinci", "the vinci", "assistant", "draw"],
  },
  {
    href: "/chalkboard",
    label: "Infinity Chalkboard",
    phrases: ["infinity chalkboard", "chalkboard", "chalk board", "blackboard", "board"],
  },
  {
    href: "/gravity",
    label: "Gravity Board",
    phrases: ["gravity board", "gravity", "event horizon", "black hole"],
  },
  {
    href: "/profile",
    label: "Profile",
    phrases: ["profile", "account", "settings", "my voice"],
  },
  { href: "/privacy", label: "Privacy", phrases: ["privacy"] },
  { href: "/", label: "Home", phrases: ["home", "front page", "landing page", "start"] },
  {
    href: "/login",
    label: "Sign in",
    phrases: ["sign in", "log in", "login", "identify me", "verify me"],
  },
];

const COMMANDS: { command: VoiceCommand; phrases: string[] }[] = [
  { command: { kind: "signOut" }, phrases: ["sign out", "log out", "logout", "goodbye"] },
  { command: { kind: "back" }, phrases: ["go back", "back"] },
  { command: { kind: "help" }, phrases: ["help", "what can i say", "where can i go"] },
];

function normalise(text: string): string {
  return ` ${text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;
}

/**
 * Turns one spoken utterance into a navigation command, or null if it names nowhere.
 * Phrases match on word boundaries anywhere in the utterance ("take me to the chalkboard"),
 * and `isEnabled` hides destinations behind feature flags.
 */
export function parseVoiceCommand(
  text: string,
  isEnabled: (href: string) => boolean = () => true,
): VoiceCommand | null {
  const said = normalise(text);
  const heard = (phrase: string) => said.includes(` ${phrase} `);

  for (const { command, phrases } of COMMANDS) {
    if (command.kind === "signOut" && phrases.some(heard)) return command;
  }

  let best: { destination: Destination; length: number } | null = null;
  for (const destination of DESTINATIONS) {
    if (!isEnabled(destination.href)) continue;
    for (const phrase of destination.phrases) {
      if (heard(phrase) && phrase.length > (best?.length ?? 0))
        best = { destination, length: phrase.length };
    }
  }
  if (best)
    return { kind: "go", href: best.destination.href, label: best.destination.label };

  for (const { command, phrases } of COMMANDS) {
    if (phrases.some(heard)) return command;
  }
  return null;
}
