import { NextResponse } from "next/navigation";
import { ZodError } from "zod";

export interface ApiResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export interface ApiResponseBody<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: ApiResponseMeta;
  error?: {
    code: string;
    details?: unknown;
  };
}

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;

  constructor(message: string, statusCode = 400, code = "BAD_REQUEST", details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function successResponse<T>(data: T, message?: string, meta?: ApiResponseMeta, status = 200) {
  return Response.json(
    {
      success: true,
      message,
      data,
      meta,
    },
    { status }
  );
}

export function errorResponse(error: unknown) {
  // 1. Zod Validation Errors
  if (error instanceof ZodError) {
    const formattedErrors = error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));

    return Response.json(
      {
        success: false,
        message: "Validation failed on the provided input",
        error: {
          code: "VALIDATION_ERROR",
          details: formattedErrors,
        },
      },
      { status: 422 }
    );
  }

  // 2. Custom Application Errors
  if (error instanceof AppError) {
    return Response.json(
      {
        success: false,
        message: error.message,
        error: {
          code: error.code,
          details: error.details,
        },
      },
      { status: error.statusCode }
    );
  }

  // 3. Fallback Generic Internal Server Error
  console.error("[ScholarAI Internal Error]:", error);
  const isDev = process.env.NODE_ENV === "development";

  return Response.json(
    {
      success: false,
      message: "An internal server error occurred. Please try again later.",
      error: {
        code: "INTERNAL_SERVER_ERROR",
        details: isDev && error instanceof Error ? error.stack : undefined,
      },
    },
    { status: 500 }
  );
}
