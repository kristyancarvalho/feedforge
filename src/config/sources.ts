import { loadSourcesConfig } from "../modules/sources/source-loader";
import type { SourcesConfig } from "../modules/sources/source.schema";
import { getEnv } from "./env";

export const loadConfiguredSources = async (): Promise<SourcesConfig> => {
  const env = getEnv();
  return loadSourcesConfig(env.SOURCES_FILE);
};
