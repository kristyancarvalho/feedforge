import type {
  CrawlerRunInfo,
  NewsFilters,
  NewsItem,
  PaginatedResult,
  SourceHealth,
  SourceSyncResult
} from "./types";

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    status: number,
    details: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const headers: Record<string, string> = {
    ...((init?.headers as Record<string, string>) ?? {})
  };
  if (init?.body !== undefined) {
    headers["content-type"] = "application/json";
  }

  let response: Response;
  try {
    response = await fetch(path, { ...init, headers });
  } catch (error) {
    throw new ApiError(
      "NETWORK_ERROR",
      error instanceof Error ? error.message : "Network request failed.",
      0
    );
  }

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const errorBody = payload?.error;
    throw new ApiError(
      errorBody?.code ?? "INTERNAL_ERROR",
      errorBody?.message ?? "Request failed.",
      response.status,
      errorBody?.details ?? {}
    );
  }

  return payload as T;
};

const buildQuery = (filters: NewsFilters): string => {
  const params = new URLSearchParams();
  const entries = Object.entries(filters) as [keyof NewsFilters, unknown][];
  for (const [key, value] of entries) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    params.set(key, String(value));
  }
  const query = params.toString();
  return query ? `?${query}` : "";
};

export const api = {
  listNews: (filters: NewsFilters = {}): Promise<PaginatedResult<NewsItem>> =>
    request(`/api/news${buildQuery(filters)}`),

  getNews: (id: string): Promise<NewsItem> => request(`/api/news/${id}`),

  saveNews: (id: string): Promise<NewsItem> =>
    request(`/api/news/${id}/save`, { method: "POST" }),

  unsaveNews: (id: string): Promise<NewsItem> =>
    request(`/api/news/${id}/save`, { method: "DELETE" }),

  updateStatus: (id: string, status: string, notes?: string): Promise<NewsItem> =>
    request(`/api/news/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(notes === undefined ? { status } : { status, notes })
    }),

  listSources: (): Promise<{ data: SourceHealth[] }> => request(`/api/sources`),

  reloadSources: (): Promise<SourceSyncResult> =>
    request(`/api/sources/reload`, { method: "POST" }),

  listRuns: (page = 1, limit = 20): Promise<PaginatedResult<CrawlerRunInfo>> =>
    request(`/api/runs?page=${page}&limit=${limit}`),

  latestRun: (): Promise<{ data: CrawlerRunInfo | null }> =>
    request(`/api/runs/latest`),

  runCrawler: (): Promise<{ data: CrawlerRunInfo }> =>
    request(`/api/crawler/run`, { method: "POST" })
};
