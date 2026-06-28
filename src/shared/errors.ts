export type ErrorCode =
  | "SOURCE_VALIDATION_FAILED"
  | "SOURCE_RELOAD_FAILED"
  | "CRAWLER_ALREADY_RUNNING"
  | "NEWS_ITEM_NOT_FOUND"
  | "INVALID_STATUS"
  | "VALIDATION_ERROR"
  | "DATABASE_ERROR"
  | "NOT_FOUND"
  | "INTERNAL_ERROR";

export interface ErrorResponseBody {
  error: {
    code: ErrorCode;
    message: string;
    details: Record<string, unknown>;
  };
}

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly details: Record<string, unknown>;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode = 400,
    details: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const toErrorResponse = (error: AppError): ErrorResponseBody => ({
  error: {
    code: error.code,
    message: error.message,
    details: error.details
  }
});
