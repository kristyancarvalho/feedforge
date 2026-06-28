export interface PaginationInput {
  page?: number | string | null;
  limit?: number | string | null;
}

export interface Pagination {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const toPositiveInt = (value: number | string | null | undefined, fallback: number): number => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  const truncated = Math.trunc(parsed);
  return truncated > 0 ? truncated : fallback;
};

export const resolvePagination = (input: PaginationInput): Pagination => {
  const page = toPositiveInt(input.page, 1);
  const limit = Math.min(toPositiveInt(input.limit, DEFAULT_LIMIT), MAX_LIMIT);
  return { page, limit, skip: (page - 1) * limit };
};

export const buildPaginatedResult = <T>(
  data: T[],
  total: number,
  pagination: Pagination
): PaginatedResult<T> => ({
  data,
  page: pagination.page,
  limit: pagination.limit,
  total,
  totalPages: pagination.limit === 0 ? 0 : Math.ceil(total / pagination.limit)
});
