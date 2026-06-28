import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { AppError } from "../../shared/errors";
import { sourcesConfigSchema, type SourcesConfig } from "./source.schema";

export const parseSourcesConfig = (raw: string): SourcesConfig => {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (error) {
    throw new AppError(
      "SOURCE_VALIDATION_FAILED",
      "sources.json is not valid JSON.",
      400,
      { cause: String(error) }
    );
  }

  const parsed = sourcesConfigSchema.safeParse(json);
  if (!parsed.success) {
    throw new AppError(
      "SOURCE_VALIDATION_FAILED",
      "Invalid source configuration.",
      400,
      { issues: parsed.error.issues }
    );
  }

  return parsed.data;
};

export const loadSourcesConfig = async (filePath: string): Promise<SourcesConfig> => {
  const absolutePath = resolve(process.cwd(), filePath);

  let raw: string;
  try {
    raw = await readFile(absolutePath, "utf8");
  } catch (error) {
    throw new AppError(
      "SOURCE_VALIDATION_FAILED",
      `Unable to read sources file at ${filePath}.`,
      400,
      { cause: String(error) }
    );
  }

  return parseSourcesConfig(raw);
};
