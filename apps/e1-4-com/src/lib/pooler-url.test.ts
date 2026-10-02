import { describe, expect, it } from "vitest";

import { withPgbouncerParams } from "./pooler-url";

const pooler = "postgresql://u:p@aws-0-x.pooler.supabase.com:6543/postgres";

describe("withPgbouncerParams", () => {
  it("adds both params with ? when there is no query", () => {
    expect(withPgbouncerParams(pooler)).toBe(
      `${pooler}?pgbouncer=true&connection_limit=1`,
    );
  });

  it("appends with & when a query exists", () => {
    expect(withPgbouncerParams(`${pooler}?sslmode=require`)).toBe(
      `${pooler}?sslmode=require&pgbouncer=true&connection_limit=1`,
    );
  });

  it("keeps an existing connection_limit", () => {
    expect(withPgbouncerParams(`${pooler}?connection_limit=5`)).toBe(
      `${pooler}?connection_limit=5&pgbouncer=true`,
    );
  });

  it("corrects pgbouncer=false", () => {
    const out = new URL(withPgbouncerParams(`${pooler}?pgbouncer=false`));
    expect(out.searchParams.get("pgbouncer")).toBe("true");
    expect(out.searchParams.get("connection_limit")).toBe("1");
  });

  it("leaves a URL that already has pgbouncer=true alone", () => {
    const url = `${pooler}?pgbouncer=true`;
    expect(withPgbouncerParams(url)).toBe(url);
  });

  it("leaves other ports and unparseable values alone", () => {
    const direct = "postgresql://u:p@db.x.supabase.co:5432/postgres";
    expect(withPgbouncerParams(direct)).toBe(direct);
    expect(withPgbouncerParams("not a url")).toBe("not a url");
  });
});
