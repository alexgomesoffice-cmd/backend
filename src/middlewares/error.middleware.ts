/**
 * FILE: src/middlewares/error.middleware.ts
 * PURPOSE: Global error handler middleware
 *
 * IMPORTANT: This must be the LAST middleware added to Express app
 * It catches ALL errors from routes and previous middlewares
 *
 * ERROR FLOW:
 * 1. Service throws an error
 * 2. Controller doesn't catch it
 * 3. Error bubbles up to Express
 * 4. This middleware catches it
 * 5. Returns a consistent JSON error response
 *
 * USAGE:
 * import { errorHandler } from '@/middlewares/error.middleware';
 *
 * app.use(routes);  // All routes first
 * app.use(errorHandler);  // Error handler LAST
 */

import type { Request, Response, NextFunction } from "express";
import { logger } from "@/utils/logger";

/**
 * Custom application error class
 * Allows us to differentiate between known and unknown errors
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_ERROR",
    public details?: any
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Global error handler middleware
 * MUST be the last middleware added to app
 *
 * Express error handlers have 4 parameters: (err, req, res, next)
 * This is required for Express to recognize it as an error handler
 *
 * @param err - The error object
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Next function (sometimes unused, but required for Express to recognize this as error handler)
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction // This parameter must be here even if unused, for Express to recognize this as error handler
): void {
  // Ensure we have statusCode (default to 500)
  let statusCode = 500;
  let code = "INTERNAL_ERROR";
  let details = undefined;

  // If it's our custom AppError, use its properties
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    details = err.details;
  }

  // Log the error for debugging
  logger.error("Unhandled error", {
    message: err.message,
    statusCode,
    code,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Send error response to client
  res.status(statusCode).json({
    success: false,
    message: err.message || "An unexpected error occurred",
    error: {
      code,
      details,
    },
    data: null,
  });
}
