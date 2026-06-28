import { describe, expect, it } from "vitest";
import { isMatchStrength, matchStrengthFromScore } from "./matchStrength";

describe("matchStrengthFromScore", () => {
  it("maps the strong band (80-100)", () => {
    expect(matchStrengthFromScore(80)).toBe("strong");
    expect(matchStrengthFromScore(100)).toBe("strong");
  });

  it("maps the good band (65-79)", () => {
    expect(matchStrengthFromScore(65)).toBe("good");
    expect(matchStrengthFromScore(79)).toBe("good");
  });

  it("maps the weak band (45-64)", () => {
    expect(matchStrengthFromScore(45)).toBe("weak");
    expect(matchStrengthFromScore(64)).toBe("weak");
  });

  it("maps the low band (0-44)", () => {
    expect(matchStrengthFromScore(0)).toBe("low");
    expect(matchStrengthFromScore(44)).toBe("low");
  });

  it("treats band edges as inclusive lower bounds", () => {
    expect(matchStrengthFromScore(79.9)).toBe("good");
    expect(matchStrengthFromScore(64.9)).toBe("weak");
    expect(matchStrengthFromScore(44.9)).toBe("low");
  });
});

describe("isMatchStrength", () => {
  it("accepts every valid band value", () => {
    expect(isMatchStrength("strong")).toBe(true);
    expect(isMatchStrength("good")).toBe(true);
    expect(isMatchStrength("weak")).toBe(true);
    expect(isMatchStrength("low")).toBe(true);
  });

  it("rejects unknown values", () => {
    expect(isMatchStrength("")).toBe(false);
    expect(isMatchStrength("medium")).toBe(false);
    expect(isMatchStrength("STRONG")).toBe(false);
  });
});
