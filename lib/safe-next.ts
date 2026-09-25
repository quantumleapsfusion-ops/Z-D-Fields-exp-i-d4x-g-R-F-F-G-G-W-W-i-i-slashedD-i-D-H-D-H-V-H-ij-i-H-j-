/** Only allow same-origin relative paths as post-sign-in destinations. */
export function safeNextPath(next: unknown, fallback = '/stream'): string {
  return typeof next === 'string' && next.startsWith('/') && !next.startsWith('//')
    ? next
    : fallback;
}
