const TRACKING_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "utm_name",
  "fbclid",
  "gclid",
  "mc_cid",
  "mc_eid"
]);

export interface NormalizedUrl {
  canonicalUrl: string | null;
  normalizedUrl: string;
}

export const normalizeUrl = (rawUrl: string, baseUrl?: string): NormalizedUrl => {
  const trimmed = rawUrl.trim();

  if (!trimmed) {
    return { canonicalUrl: null, normalizedUrl: "" };
  }

  let parsed: URL;
  try {
    parsed = baseUrl ? new URL(trimmed, baseUrl) : new URL(trimmed);
  } catch {
    return { canonicalUrl: null, normalizedUrl: trimmed.toLowerCase() };
  }

  parsed.hash = "";

  for (const key of [...parsed.searchParams.keys()]) {
    if (TRACKING_PARAMS.has(key.toLowerCase())) {
      parsed.searchParams.delete(key);
    }
  }

  parsed.searchParams.sort();

  const canonicalUrl = parsed.toString();

  const host = parsed.host.toLowerCase().replace(/^www\./, "");
  const path = parsed.pathname.replace(/\/+$/, "");
  const search = parsed.search;
  const normalizedUrl = `${host}${path}${search}`.toLowerCase();

  return { canonicalUrl, normalizedUrl };
};

export const extractDomain = (rawUrl: string): string => {
  try {
    return new URL(rawUrl).host.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
};
