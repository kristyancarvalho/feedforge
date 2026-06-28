import { request } from "undici";

export interface FetchTextOptions {
  userAgent: string;
  timeoutMs: number;
}

export const fetchText = async (
  url: string,
  options: FetchTextOptions
): Promise<string> => {
  const response = await request(url, {
    method: "GET",
    maxRedirections: 5,
    headersTimeout: options.timeoutMs,
    bodyTimeout: options.timeoutMs,
    headers: {
      "user-agent": options.userAgent,
      accept:
        "application/rss+xml, application/atom+xml, application/xml, text/xml, text/html;q=0.9, */*;q=0.8"
    }
  });

  if (response.statusCode >= 400) {
    throw new Error(`Request failed with status ${response.statusCode}`);
  }

  return response.body.text();
};
