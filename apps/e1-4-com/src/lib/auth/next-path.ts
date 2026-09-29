/** Only same-origin absolute paths may be used as a post-verification destination. */
export function safeNextPath(next: unknown): string {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
    ? next
    : "/profile";
}
