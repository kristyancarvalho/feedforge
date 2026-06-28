type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

const write = (level: LogLevel, message: string, context?: LogContext): void => {
  const entry = {
    level,
    time: new Date().toISOString(),
    message,
    ...(context ? { context } : {})
  };
  const line = JSON.stringify(entry);
  if (level === "error") {
    process.stderr.write(`${line}\n`);
    return;
  }
  process.stdout.write(`${line}\n`);
};

export const logger = {
  debug: (message: string, context?: LogContext) => write("debug", message, context),
  info: (message: string, context?: LogContext) => write("info", message, context),
  warn: (message: string, context?: LogContext) => write("warn", message, context),
  error: (message: string, context?: LogContext) => write("error", message, context)
};
