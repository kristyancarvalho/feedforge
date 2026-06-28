import type {
  CrawlerRunInfo,
  NewsCursorResult,
  NewsFilters,
  NewsItem,
  PaginatedResult,
  RunFilters,
  SourceHealth,
  SourceSyncResult,
  StatusInfo
} from "./types";

export class ApiError extends Error {
  code: string;
  status: number;
  details: unknown;

  constructor(code: string, message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function buildQuery(filters: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {};
  if (init?.body) {
    headers["content-type"] = "application/json";
  }

  let response: Response;
  try {
    response = await fetch(path, { ...init, headers: { ...headers, ...(init?.headers ?? {}) } });
  } catch (error) {
    throw new ApiError("NETWORK_ERROR", "Could not reach the server.", 0, error);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  let payload: unknown = null;
  const text = await response.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const errorBody = (payload as { error?: { code?: string; message?: string; details?: unknown } } | null)?.error;
    throw new ApiError(
      errorBody?.code ?? "REQUEST_FAILED",
      errorBody?.message ?? "The request failed.",
      response.status,
      errorBody?.details
    );
  }

  return payload as T;
}

export const api = {
  listNews(filters: NewsFilters): Promise<NewsCursorResult> {
    return request<NewsCursorResult>(`/api/news${buildQuery(filters as Record<string, string | undefined>)}`);
  },
  getNews(id: string): Promise<NewsItem> {
    return request<NewsItem>(`/api/news/${encodeURIComponent(id)}`);
  },
  saveNews(id: string): Promise<NewsItem> {
    return request<NewsItem>(`/api/news/${encodeURIComponent(id)}/save`, { method: "POST" });
  },
  unsaveNews(id: string): Promise<NewsItem> {
    return request<NewsItem>(`/api/news/${encodeURIComponent(id)}/save`, { method: "DELETE" });
  },
  updateStatus(id: string, status: string, notes?: string): Promise<NewsItem> {
    const body = notes === undefined ? { status } : { status, notes };
    return request<NewsItem>(`/api/news/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      body: JSON.stringify(body)
    });
  },
  listSources(): Promise<{ data: SourceHealth[] }> {
    return request<{ data: SourceHealth[] }>("/api/sources");
  },
  reloadSources(): Promise<{ data: SourceSyncResult }> {
    return request<{ data: SourceSyncResult }>("/api/sources/reload", { method: "POST" });
  },
  listRuns(filters: RunFilters): Promise<PaginatedResult<CrawlerRunInfo>> {
    return request<PaginatedResult<CrawlerRunInfo>>(
      `/api/runs${buildQuery(filters as Record<string, string | undefined>)}`
    );
  },
  latestRun(): Promise<{ data: CrawlerRunInfo | null }> {
    return request<{ data: CrawlerRunInfo | null }>("/api/runs/latest");
  },
  runCrawler(): Promise<{ data: CrawlerRunInfo }> {
    return request<{ data: CrawlerRunInfo }>("/api/crawler/run", { method: "POST" });
  },
  getStatus(): Promise<StatusInfo> {
    return request<StatusInfo>("/api/status");
  }
};
