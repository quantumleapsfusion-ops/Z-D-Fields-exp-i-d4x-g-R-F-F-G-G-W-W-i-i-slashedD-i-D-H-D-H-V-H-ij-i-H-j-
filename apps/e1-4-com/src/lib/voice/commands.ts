/**
 * Spoken navigation grammar. Voice is the site's navigation: every surface is
 * reachable by saying its name, optionally wrapped in "go to" / "open" / "show
 * me" / "take me to". Unrecognised speech is returned as `unknown` so callers
 * can stay quiet rather than guess.
 */

export type NavTarget = {
  href: string;
  /** Human label spoken back / shown in the toast. */
  label: string;
  /** Requires a verified voice (protected route). */
  protected: boolean;
  aliases: string[];
};

export const NAV_TARGETS: NavTarget[] = [
  {
    href: "/",
    label: "Home",
    protected: false,
    aliases: ["home", "start", "landing", "front page", "beginning"],
  },
  {
    href: "/stream",
    label: "Voice Stream",
    protected: true,
    aliases: [
      "stream",
      "streams",
      "voice stream",
      "my stream",
      "recording",
      "diary",
      "record",
    ],
  },
  {
    href: "/davinci",
    label: "Da Vinci",
    protected: true,
    aliases: [
      "da vinci",
      "davinci",
      "the vinci",
      "leonardo",
      "vinci",
      "assistant",
      "ari",
    ],
  },
  {
    href: "/chalkboard",
    label: "Infinity Chalkboard",
    protected: true,
    aliases: [
      "chalkboard",
      "chalk board",
      "board",
      "infinity",
      "infinity chalkboard",
      "the board",
      "blackboard",
    ],
  },
  {
    href: "/gravity",
    label: "Gravity Board",
    protected: true,
    aliases: ["gravity", "gravity board", "black hole", "event horizon", "singularity"],
  },
  {
    href: "/profile",
    label: "You",
    protected: true,
    aliases: ["profile", "my profile", "me", "you", "account", "my account", "settings"],
  },
  {
    href: "/login",
    label: "Voice gate",
    protected: false,
    aliases: [
      "login",
      "log in",
      "sign in",
      "verify",
      "verify me",
      "identify",
      "identify me",
      "who am i",
      "gate",
      "voice gate",
      "enroll",
      "enrol",
    ],
  },
];

export type NavCommand =
  | { kind: "navigate"; target: NavTarget }
  | { kind: "back" }
  | { kind: "sign-out" }
  | { kind: "help" }
  | { kind: "unknown"; text: string };

const LEADERS =
  /^(?:(?:hey |ok |okay )?(?:e one four|e1-4|earthling|computer)[,]? )?(?:please )?(?:(?:can|could|would) you )?(?:(?:go|take me|bring me|switch|jump|navigate|head) (?:back )?to|open(?: up)?|show(?: me)?|launch|start|visit|let'?s go to|i want|pull up)?\s*(?:the |my )?/;

function clean(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?'"]+/g, (m) => (m === "'" ? "'" : " "))
    .replace(/\s+/g, " ")
    .trim();
}

export function parseNavCommand(raw: string): NavCommand {
  const t = clean(raw);
  if (!t) return { kind: "unknown", text: raw };

  if (/^(?:go |take me |head )?back$/.test(t) || /^(?:previous|last) page$/.test(t)) {
    return { kind: "back" };
  }
  if (/^(?:please )?(?:sign|log) (?:me )?out$|^(?:forget me|goodbye|bye)$/.test(t)) {
    return { kind: "sign-out" };
  }
  if (/^(?:help|what can i say|commands|options)(?: please)?$/.test(t)) {
    return { kind: "help" };
  }

  const stripped = t
    .replace(LEADERS, "")
    .replace(/ (?:page|screen|surface|please)$/g, "")
    .trim();
  for (const target of NAV_TARGETS) {
    if (target.aliases.includes(stripped)) return { kind: "navigate", target };
  }
  // Tolerate trailing chatter: "open the chalkboard for me".
  for (const target of NAV_TARGETS) {
    for (const alias of target.aliases) {
      if (alias.length >= 5 && new RegExp(`\\b${alias}\\b`).test(stripped)) {
        return { kind: "navigate", target };
      }
    }
  }
  return { kind: "unknown", text: raw };
}

/** One-line cheat sheet shown under the mic. */
export const HELP_TEXT =
  'Say "stream", "Da Vinci", "chalkboard", "gravity", "profile", "home", "back" or "sign out".';
