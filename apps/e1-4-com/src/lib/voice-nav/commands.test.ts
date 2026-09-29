import { describe, expect, it } from "vitest";

import { parseVoiceCommand } from "./commands";

const go = (href: string) => expect.objectContaining({ kind: "go", href });

describe("parseVoiceCommand", () => {
  it.each([
    ["open chalkboard", "/chalkboard"],
    ["Take me to the Infinity Chalkboard, please.", "/chalkboard"],
    ["board", "/chalkboard"],
    ["go to Da Vinci", "/davinci"],
    ["davinci", "/davinci"],
    ["show my voice stream", "/stream"],
    ["gravity board", "/gravity"],
    ["open my profile", "/profile"],
    ["home", "/"],
    ["sign in", "/login"],
  ])("%s → %s", (text, href) => {
    expect(parseVoiceCommand(text)).toEqual(go(href));
  });

  it("prefers the longest phrase heard", () => {
    expect(parseVoiceCommand("gravity board")).toEqual(go("/gravity"));
    expect(parseVoiceCommand("the voice stream recording")).toEqual(go("/stream"));
  });

  it("matches whole words only", () => {
    expect(parseVoiceCommand("keyboard")).toBeNull();
    expect(parseVoiceCommand("backwards")).toBeNull();
  });

  it("understands back, sign out and help", () => {
    expect(parseVoiceCommand("go back")).toEqual({ kind: "back" });
    expect(parseVoiceCommand("sign out")).toEqual({ kind: "signOut" });
    expect(parseVoiceCommand("log out please")).toEqual({ kind: "signOut" });
    expect(parseVoiceCommand("what can I say")).toEqual({ kind: "help" });
  });

  it("skips disabled destinations", () => {
    expect(parseVoiceCommand("open gravity", (href) => href !== "/gravity")).toBeNull();
  });

  it("returns null for anything else", () => {
    expect(parseVoiceCommand("the weather is nice")).toBeNull();
    expect(parseVoiceCommand("")).toBeNull();
  });
});
