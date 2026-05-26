import { Request, Response, NextFunction } from "express";

interface AppError {
  status?: number;
  message?: string;
  stack?: string;
}

/**
 * Global error handler — must be registered last in the Express middleware chain.
 * Translates both thrown objects and Error instances into a uniform JSON response.
 */
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const isDev = process.env.NODE_ENV !== "production";

  const status  = err.status  ?? 500;
  const message = err.message ?? "An unexpected error occurred.";

  if (status >= 500) {
    console.error("[Error]", err.stack ?? err);
  }

  res.status(status).json({
    success: false,
    message,
    ...(isDev && status >= 500 && { stack: err.stack }),
  });
}
