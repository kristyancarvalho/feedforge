import { createHash } from "node:crypto";
import { normalizeText } from "../../shared/text";
import { extractDomain } from "./url-normalizer";

export const generateFingerprint = (
  title: string,
  canonicalUrl: string | null,
  sourceUrl: string
): string => {
  const normalizedTitle = normalizeText(title);
  const anchor = canonicalUrl
    ? canonicalUrl.toLowerCase()
    : extractDomain(sourceUrl);

  return createHash("sha256")
    .update(`${normalizedTitle}::${anchor}`)
    .digest("hex");
};
