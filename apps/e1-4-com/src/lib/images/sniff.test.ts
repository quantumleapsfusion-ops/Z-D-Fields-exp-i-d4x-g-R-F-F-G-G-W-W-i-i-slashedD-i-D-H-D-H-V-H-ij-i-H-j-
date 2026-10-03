import { describe, expect, it } from "vitest";

import { sniffImageType } from "./sniff";

const bytes = (...b: number[]) => new Uint8Array(b);

describe("sniffImageType", () => {
  it("recognises the four avatar formats by their signatures", () => {
    expect(
      sniffImageType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0)),
    ).toBe("image/png");
    expect(sniffImageType(bytes(0xff, 0xd8, 0xff, 0xe0, 0, 0x10))).toBe("image/jpeg");
    expect(sniffImageType(bytes(0x47, 0x49, 0x46, 0x38, 0x39, 0x61))).toBe("image/gif");
    expect(sniffImageType(bytes(0x47, 0x49, 0x46, 0x38, 0x37, 0x61))).toBe("image/gif");
    expect(
      sniffImageType(bytes(0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50)),
    ).toBe("image/webp");
  });

  it("rejects what only claims to be an image", () => {
    expect(
      sniffImageType(
        new TextEncoder().encode("<svg xmlns='http://www.w3.org/2000/svg'/>"),
      ),
    ).toBe(null);
    expect(sniffImageType(new TextEncoder().encode("<script>alert(1)</script>"))).toBe(
      null,
    );
    expect(
      sniffImageType(bytes(0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x41, 0x56, 0x45)),
    ).toBe(null); // a WAV, not a WebP
    expect(sniffImageType(bytes())).toBe(null);
    expect(sniffImageType(bytes(0x89, 0x50))).toBe(null);
  });
});
