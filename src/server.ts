import { buildApp } from "./app";
import { logger } from "./shared/logger";

const start = async () => {
  const port = Number(process.env.APP_PORT ?? 3000);
  const app = buildApp();

  try {
    await app.listen({ port, host: "0.0.0.0" });
    logger.info("app started", { port });
  } catch (error) {
    logger.error("app failed to start", { error: String(error) });
    process.exit(1);
  }
};

void start();
