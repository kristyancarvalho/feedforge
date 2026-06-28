import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api/client";
import { messageFromError } from "./useAsync";
import type { NewsFilters, NewsItem } from "../api/types";

function serialize(filters: NewsFilters): string {
  const entries = Object.entries(filters)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(entries);
}

export function useInfiniteNews(filters: NewsFilters) {
  const key = useMemo(() => serialize(filters), [filters]);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const [items, setItems] = useState<NewsItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const cursorRef = useRef<string | null>(null);
  const seenRef = useRef<Set<string>>(new Set());
  const generationRef = useRef(0);
  const inFlightRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async (reset: boolean) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    const generation = generationRef.current;
    if (reset) {
      setLoading(true);
      setError(null);
    } else {
      setLoadingMore(true);
    }
    try {
      const cursor = reset ? undefined : cursorRef.current ?? undefined;
      const result = await api.listNews({ ...filtersRef.current, cursor });
      if (generation !== generationRef.current) return;
      cursorRef.current = result.nextCursor;
      setHasMore(result.hasMore);
      setTotal(result.total);
      if (reset) {
        seenRef.current = new Set(result.items.map((item) => item.id));
        setItems(result.items);
      } else {
        const fresh = result.items.filter((item) => !seenRef.current.has(item.id));
        fresh.forEach((item) => seenRef.current.add(item.id));
        setItems((prev) => [...prev, ...fresh]);
      }
      setError(null);
    } catch (caught) {
      if (generation !== generationRef.current) return;
      setError(messageFromError(caught));
    } finally {
      if (generation === generationRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
      inFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    generationRef.current += 1;
    cursorRef.current = null;
    seenRef.current = new Set();
    inFlightRef.current = false;
    setItems([]);
    setHasMore(false);
    void load(true);
  }, [key, load]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !inFlightRef.current) {
          void load(false);
        }
      },
      { rootMargin: "320px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, load, items.length]);

  const refresh = useCallback(() => {
    generationRef.current += 1;
    cursorRef.current = null;
    seenRef.current = new Set();
    inFlightRef.current = false;
    void load(true);
  }, [load]);

  const updateItem = useCallback((next: NewsItem) => {
    setItems((prev) => prev.map((item) => (item.id === next.id ? next : item)));
  }, []);

  const removeItem = useCallback((id: string) => {
    seenRef.current.delete(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return {
    items,
    total,
    loading,
    loadingMore,
    error,
    hasMore,
    sentinelRef,
    refresh,
    retry: () => load(true),
    updateItem,
    removeItem
  };
}
