export type MatchStrength = "strong" | "good" | "weak" | "low";

export function matchStrengthFromScore(score: number): MatchStrength {
  if (score >= 80) {
    return "strong";
  }
  if (score >= 65) {
    return "good";
  }
  if (score >= 45) {
    return "weak";
  }
  return "low";
}

export function isMatchStrength(value: string): value is MatchStrength {
  return value === "strong" || value === "good" || value === "weak" || value === "low";
}
