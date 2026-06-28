export type RunStatus = "running" | "success" | "partial_success" | "failed" | "skipped";

export type RunTrigger = "manual" | "cron" | "startup";

export const calculateRunStatus = (
  totalSources: number,
  successfulSources: number,
  failedSources: number
): RunStatus => {
  if (totalSources === 0) {
    return "success";
  }
  if (successfulSources === totalSources) {
    return "success";
  }
  if (successfulSources === 0) {
    return "failed";
  }
  if (successfulSources > 0 && failedSources > 0) {
    return "partial_success";
  }
  return "success";
};
