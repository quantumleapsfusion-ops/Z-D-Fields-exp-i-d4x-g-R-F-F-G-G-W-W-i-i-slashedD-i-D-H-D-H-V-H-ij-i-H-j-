import { describe, expect, it } from "vitest";

import { parseVoiceCommand } from "./commands";

describe("voice navigation", () => {
  it("recognizes deliberate navigation commands", () => {
    expect(parseVoiceCommand("Log in!")).toBe("login");
    expect(parseVoiceCommand("Open profile.")).toBe("profile");
    expect(parseVoiceCommand("Share with friends")).toBe("stream");
    expect(parseVoiceCommand("Da Vinci")).toBe("davinci");
    expect(parseVoiceCommand("open gravity board")).toBe("gravity");
    expect(parseVoiceCommand("Infinity chalkboard")).toBe("chalkboard");
    expect(parseVoiceCommand("home")).toBe("home");
  });

  it("does not treat arbitrary speech as a command", () => {
    expect(parseVoiceCommand("I said log in to my friend")).toBeNull();
    expect(parseVoiceCommand("share my password")).toBeNull();
    expect(parseVoiceCommand("")).toBeNull();
  });
});
