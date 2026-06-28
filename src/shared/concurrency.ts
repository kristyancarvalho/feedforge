export const mapWithConcurrency = async <T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> => {
  const results: R[] = new Array(items.length);
  const effectiveLimit = Math.max(1, Math.min(limit, items.length || 1));
  let cursor = 0;

  const runners = Array.from({ length: effectiveLimit }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      const item = items[index] as T;
      results[index] = await worker(item, index);
    }
  });

  await Promise.all(runners);
  return results;
};
