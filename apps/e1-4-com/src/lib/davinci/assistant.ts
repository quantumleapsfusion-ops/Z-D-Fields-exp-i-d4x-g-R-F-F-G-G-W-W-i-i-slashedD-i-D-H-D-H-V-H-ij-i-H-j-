import type { Playlist } from "@/lib/audio/store";

export type AssistantAction =
  | { kind: "navigate"; href: string; label: string }
  | { kind: "synthesis"; title: string; summary: string; segments: number }
  | { kind: "math"; expression: string; result: string | null }
  | { kind: "answer"; text: string };

const ROUTES: { match: RegExp; href: string; label: string }[] = [
  { match: /\b(streams?|feed|voice)\b/i, href: "/stream", label: "Voice Stream" },
  {
    match: /\b(boards?|chalk|canvas|draw)\b/i,
    href: "/chalkboard",
    label: "Infinity Chalkboard",
  },
  { match: /\b(da ?vinci|assistant|sketch)\b/i, href: "/davinci", label: "Da Vinci" },
  { match: /\b(profile|account|me|settings)\b/i, href: "/profile", label: "Profile" },
  { match: /\b(home|landing|start)\b/i, href: "/", label: "Home" },
];

const NAV_VERB = /^(go|open|take me|show|navigate|switch|jump)\b/i;

/**
 * Mocked Da Vinci brain. Runs entirely on the client until the LLM-backed endpoint exists:
 * natural-language navigation, extractive synthesis of whatever is loaded in the audio dock,
 * and a small arithmetic evaluator for the "math" intent.
 */
export function interpret(input: string, playlist: Playlist | null): AssistantAction {
  const q = input.trim();
  if (!q) return { kind: "answer", text: "Say or type what you need." };

  if (NAV_VERB.test(q)) {
    const route = ROUTES.find((r) => r.match.test(q));
    if (route) return { kind: "navigate", href: route.href, label: route.label };
  }

  if (/\b(summar|synth|recap|what (did|was)|gist|tl;?dr)/i.test(q)) {
    if (!playlist) {
      return {
        kind: "answer",
        text: "Nothing is loaded in the dock. Open a stream and I'll synthesise it.",
      };
    }
    return {
      kind: "synthesis",
      title: playlist.title,
      summary: synthesise(playlist),
      segments: playlist.segments.length,
    };
  }

  const expression = extractExpression(q);
  if (expression) {
    return { kind: "math", expression, result: evaluate(expression) };
  }

  const route = ROUTES.find((r) => r.match.test(q));
  if (route) return { kind: "navigate", href: route.href, label: route.label };

  return {
    kind: "answer",
    text: 'I can navigate ("open the board"), synthesise the loaded stream ("summarise") or work an expression ("2^10 / 4"). Full reasoning arrives with the LLM hookup.',
  };
}

function synthesise(playlist: Playlist): string {
  const text = playlist.segments
    .map((s) => s.transcript?.trim())
    .filter((t): t is string => Boolean(t))
    .join(" ");
  if (!text) return "The loaded stream has no transcript yet.";
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [text];
  const lead = sentences.slice(0, 2).join(" ").trim();
  const words = text.split(/\s+/).length;
  return `${lead}${sentences.length > 2 ? " …" : ""} (${words} words across ${playlist.segments.length} parts.)`;
}

function extractExpression(q: string): string | null {
  const cleaned = q
    .replace(/^(what('| i)s|calculate|compute|solve|evaluate|eval)\b/i, "")
    .replace(/[=?]+\s*$/, "")
    .trim();
  return /^[\d\s+\-*/^().]+$/.test(cleaned) && /\d/.test(cleaned) ? cleaned : null;
}

/** Recursive-descent evaluator for + - * / ^ and parentheses; null on any malformed input. */
export function evaluate(expression: string): string | null {
  const tokens = expression.match(/\d+(\.\d+)?|[+\-*/^()]/g);
  if (!tokens) return null;
  let i = 0;
  const peek = () => tokens[i];
  const next = () => tokens[i++];

  const primary = (): number => {
    const t = next();
    if (t === undefined) throw new Error("eof");
    if (t === "(") {
      const v = expr();
      if (next() !== ")") throw new Error("paren");
      return v;
    }
    if (t === "-") return -primary();
    if (t === "+") return primary();
    if (!/^\d/.test(t)) throw new Error("token");
    return Number(t);
  };
  const power = (): number => {
    const base = primary();
    return peek() === "^" ? (next(), Math.pow(base, power())) : base;
  };
  const term = (): number => {
    let v = power();
    while (peek() === "*" || peek() === "/")
      v = next() === "*" ? v * power() : v / power();
    return v;
  };
  const expr = (): number => {
    let v = term();
    while (peek() === "+" || peek() === "-") v = next() === "+" ? v + term() : v - term();
    return v;
  };

  try {
    const v = expr();
    if (i !== tokens.length || !Number.isFinite(v)) return null;
    return Number.isInteger(v) ? String(v) : v.toPrecision(10).replace(/\.?0+$/, "");
  } catch {
    return null;
  }
}
