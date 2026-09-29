import { describe, expect, it } from "vitest";

import { parseNavCommand } from "./commands";

function href(text: string): string | null {
  const c = parseNavCommand(text);
  return c.kind === "navigate" ? c.target.href : null;
}

describe("parseNavCommand", () => {
  it("maps bare surface names", () => {
    expect(href("Stream.")).toBe("/stream");
    expect(href("da vinci")).toBe("/davinci");
    expect(href("Chalkboard")).toBe("/chalkboard");
    expect(href("gravity")).toBe("/gravity");
    expect(href("profile")).toBe("/profile");
    expect(href("home")).toBe("/");
  });

  it("strips leaders and fillers", () => {
    expect(href("Hey Earthling, please take me to the chalkboard")).toBe("/chalkboard");
    expect(href("open my stream")).toBe("/stream");
    expect(href("show me the gravity board page")).toBe("/gravity");
    expect(href("go to Da Vinci")).toBe("/davinci");
    expect(href("can you open the chalkboard for me")).toBe("/chalkboard");
  });

  it("recognises control commands", () => {
    expect(parseNavCommand("go back").kind).toBe("back");
    expect(parseNavCommand("Sign me out.").kind).toBe("sign-out");
    expect(parseNavCommand("what can I say?").kind).toBe("help");
    expect(parseNavCommand("verify me").kind).toBe("navigate");
  });

  it("returns unknown for unrelated speech", () => {
    const c = parseNavCommand("the weather is lovely today");
    expect(c.kind).toBe("unknown");
    expect(parseNavCommand("").kind).toBe("unknown");
  });
});
