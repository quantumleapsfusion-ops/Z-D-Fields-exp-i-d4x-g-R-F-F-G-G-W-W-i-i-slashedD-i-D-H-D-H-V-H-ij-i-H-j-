import { describe, expect, it, vi } from "vitest";

import { withRuntimeEnv } from "@/lib/api/handler";
import { DaVinciUnavailableError } from "@/lib/davinci/client";
import { MissingEnvError } from "@/lib/env";

const req = new Request("https://e1-4.com/api/x", { method: "POST" });

describe("withRuntimeEnv", () => {
  it("maps a missing secret to 503 naming the variable", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await withRuntimeEnv(async () => {
      throw new MissingEnvError("DATABASE_URL");
    })(req, undefined);
    expect(res.status).toBe(503);
    await expect(res.json()).resolves.toMatchObject({
      error: expect.stringContaining("DATABASE_URL"),
    });
  });

  it("maps an unreachable Da Vinci gateway to 503 without leaking details", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await withRuntimeEnv(async () => {
      throw new DaVinciUnavailableError(0, "ECONNREFUSED 10.0.0.1:8000");
    })(req, undefined);
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toMatch(/Da Vinci is unavailable/);
    expect(JSON.stringify(body)).not.toContain("10.0.0.1");
  });

  it("re-throws anything else", async () => {
    await expect(
      withRuntimeEnv(async () => {
        throw new TypeError("boom");
      })(req, undefined),
    ).rejects.toThrow("boom");
  });
});
