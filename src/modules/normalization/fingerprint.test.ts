import { describe, expect, it } from "vitest";
import { generateFingerprint } from "./fingerprint";

describe("fingerprint generation", () => {
  it("is stable for the same title and canonical url", () => {
    const a = generateFingerprint("Linux Kernel 6.9", "https://example.com/k", "https://example.com");
    const b = generateFingerprint("Linux Kernel 6.9", "https://example.com/k", "https://example.com");
    expect(a).toBe(b);
  });

  it("ignores case and surrounding whitespace in the title", () => {
    const a = generateFingerprint("  Linux Kernel  ", "https://example.com/k", "https://example.com");
    const b = generateFingerprint("linux kernel", "https://example.com/k", "https://example.com");
    expect(a).toBe(b);
  });

  it("differs for different canonical urls", () => {
    const a = generateFingerprint("Same Title", "https://example.com/a", "https://example.com");
    const b = generateFingerprint("Same Title", "https://example.com/b", "https://example.com");
    expect(a).not.toBe(b);
  });

  it("falls back to source domain when canonical url is missing", () => {
    const a = generateFingerprint("Title", null, "https://example.com/feed");
    const b = generateFingerprint("Title", null, "https://www.example.com/other");
    expect(a).toBe(b);
  });
});
