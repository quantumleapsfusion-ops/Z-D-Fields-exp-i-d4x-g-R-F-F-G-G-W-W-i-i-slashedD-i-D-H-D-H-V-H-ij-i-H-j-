/**
 * Supabase's transaction-mode pooler (PgBouncer, port 6543) cannot hold
 * prepared statements across transactions. When DATABASE_URL points at it
 * without `pgbouncer=true`, add that flag (and `connection_limit=1` if no
 * limit is set) so saves do not fail intermittently. Any other URL, or one
 * that does not parse, is returned unchanged.
 */
export function withPgbouncerParams(raw: string): string {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return raw;
  }
  if (url.port !== "6543" || url.searchParams.get("pgbouncer") === "true") return raw;

  const extra: string[] = [];
  if (!url.searchParams.has("pgbouncer")) extra.push("pgbouncer=true");
  else url.searchParams.set("pgbouncer", "true");
  if (!url.searchParams.has("connection_limit")) extra.push("connection_limit=1");

  if (url.searchParams.has("pgbouncer")) {
    // A non-true value was present; URL serialisation keeps the rest intact.
    const base = url.toString();
    return extra.length
      ? `${base}${base.includes("?") ? "&" : "?"}${extra.join("&")}`
      : base;
  }
  return `${raw}${raw.includes("?") ? (raw.endsWith("?") || raw.endsWith("&") ? "" : "&") : "?"}${extra.join("&")}`;
}
