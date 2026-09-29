import type { Playlist } from "@/lib/audio/store";
import { byDimension, dimensionOf, neighbour } from "@/lib/dimensions";

export type AssistantAction =
  | { kind: "navigate"; href: string; label: string }
  | { kind: "synthesis"; title: string; summary: string; segments: number }
  | { kind: "math"; expression: string; result: string | null }
  | { kind: "answer"; text: string };

const ROUTES: { match: RegExp; href: string; label: string }[] = [
  { match: /\b(streams?|feed|voice|1d)\b/i, href: "/stream", label: "1D Voice Stream" },
  {
    match: /\b(gravity chalkboard|3d)\b/i,
    href: "/gravity",
    label: "3D Gravity Chalkboard",
  },
  {
    match: /\b(event horizon|horizon|4d)\b/i,
    href: "/horizon",
    label: "4D Event Horizon",
  },
  {
    match: /\b(superposition|ari|5d)\b/i,
    href: "/superposition",
    label: "5D Superposition",
  },
  {
    match: /\b(boards?|chalk(board)?s?|canvas|draw|2d)\b/i,
    href: "/chalkboard",
    label: "2D Infinity Chalkboard",
  },
  { match: /\b(profile|account|settings)\b/i, href: "/profile", label: "Profile" },
  { match: /\b(home|landing|start)\b/i, href: "/", label: "Home" },
];

const NAV_VERB = /^(go|open|take me|show|navigate|switch|jump)\b/i;

export function interpret(
  input: string,
  playlist: Playlist | null,
  pathname?: string,
): AssistantAction {
  const q = input.trim();
  if (!q) return { kind: "answer", text: "What do you need?" };

  if (/\bda\s?vinci\b/i.test(q)) {
    return { kind: "answer", text: "I'm here on every page. Press Ctrl+K." };
  }

  const explicitDimension = q.match(/\b(?:to|into)\s+(?:dimension\s*)?([1-5])d\b/i);
  if (explicitDimension) {
    const target = byDimension(Number(explicitDimension[1]) as 1 | 2 | 3 | 4 | 5);
    if (target) {
      if (dimensionOf(pathname ?? "")?.dimension === target.dimension) {
        return {
          kind: "answer",
          text: `You're already in ${target.dimension}D.`,
        };
      }
      return {
        kind: "navigate",
        href: target.href,
        label: `${target.dimension}D ${target.title}`,
      };
    }
  }

  const direction: 1 | -1 | 0 =
    /\b(lift|raise|ascend|higher)\b|\bup\s+(?:a\s+)?dimension\b/i.test(q)
      ? 1
      : /\b(collapse|lower|descend)\b|\bdown\s+(?:a\s+)?dimension\b/i.test(q)
        ? -1
        : 0;
  if (direction) {
    const current = pathname ? dimensionOf(pathname) : null;
    if (!current) return { kind: "answer", text: "Open a dimension first." };
    const target = neighbour(pathname as string, direction);
    if (!target) {
      return { kind: "answer", text: `You're already in ${current.dimension}D.` };
    }
    return {
      kind: "navigate",
      href: target.href,
      label: `${target.dimension}D ${target.title}`,
    };
  }

  if (NAV_VERB.test(q)) {
    const route = ROUTES.find((r) => r.match.test(q));
    if (route) return { kind: "navigate", href: route.href, label: route.label };
  }

  if (/\b(summar|synth|recap|what (did|was)|gist|tl;?dr)/i.test(q)) {
    if (!playlist) {
      return {
        kind: "answer",
        text: "Open a stream first.",
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
    text: "I'm here on every page. Press Ctrl+K.",
  };
}

function synthesise(playlist: Playlist): string {
  const text = playlist.segments
    .map((s) => s.transcript?.trim())
    .filter((t): t is string => Boolean(t))
    .join(" ");
  if (!text) return "There is no transcript yet.";
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [text];
  return sentences.slice(0, 2).join(" ").trim();
}

function extractExpression(q: string): string | null {
  const cleaned = q
    .replace(/^(what('| i)s|calculate|compute|solve|evaluate|eval)\b/i, "")
    .replace(/[=?]+\s*$/, "")
    .trim();
  return /^[\d\s+\-*/^().]+$/.test(cleaned) && /\d/.test(cleaned) ? cleaned : null;
}

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
