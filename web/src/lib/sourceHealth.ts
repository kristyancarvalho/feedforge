export type SourceHealthLevel = "healthy" | "degraded" | "failing" | "unknown";

interface SourceHealthInput {
  lastStatus: string;
  successCount: number;
  failureCount: number;
  enabled: boolean;
}

export function sourceHealthLevel(input: SourceHealthInput): SourceHealthLevel {
  if (input.lastStatus === "failing") {
    return "failing";
  }
  if (input.lastStatus === "healthy") {
    return input.failureCount > 0 ? "degraded" : "healthy";
  }
  return "unknown";
}
