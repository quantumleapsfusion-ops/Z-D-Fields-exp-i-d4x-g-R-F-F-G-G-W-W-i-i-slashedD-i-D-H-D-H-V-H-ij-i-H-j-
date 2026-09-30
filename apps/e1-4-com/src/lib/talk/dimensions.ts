/** The five dimensions a conversation opens in, same as the personal Voice Stream. */
export const DIMENSIONS = [
  { d: 1, href: "/stream", label: "1D Voice Stream" },
  { d: 2, href: "/chalkboard", label: "2D Infinity Chalkboard" },
  { d: 3, href: "/gravity", label: "3D Gravity Chalkboard" },
  { d: 4, href: "/horizon", label: "4D Event Horizon" },
  { d: 5, href: "/superposition", label: "5D Superposition" },
] as const;

const ID = /^[0-9a-f-]{36}$/i;

/** The conversation a dimension page is showing, from its `?talk=` query, or `null` for yours. */
export function talkSource(
  search: string | URLSearchParams | undefined | null,
): string | null {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  const id = params?.get("talk") ?? null;
  return id && ID.test(id) ? id : null;
}

export function inTalk(href: string, talkId: string | null): string {
  return talkId ? `${href}?talk=${encodeURIComponent(talkId)}` : href;
}
