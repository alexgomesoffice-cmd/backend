/**
 * FILE: src/app.ts
 * PURPOSE: Express app initialization and configuration
 *
 * WORKFLOW:
 * 1. Create Express app
 * 2. Apply middleware (logging, parsing, CORS)
 * 3. Mount routes
 * 4. Add error handler (LAST!)
 * 5. Export app for server.ts and tests
 *
 * NOTE: This file does NOT start the server
 * Server is started in server.ts
 * Separation allows tests to use app without starting server
 */

import express from "express";
import type { Express } from "express";
import cors from "cors";
import { logger } from "@/utils/logger";
import { errorHandler } from "@/middlewares/error.middleware";
import { router as routes } from "@/routes";

/**
 * Create and configure Express app
 */
export const app: Express = express();

/**
 * MIDDLEWARE SETUP
 * Order matters! Each middleware processes the request
 */

// 1. JSON parser: Convert req.body from JSON to object
// limit: prevent huge payloads that could crash server
app.use(
  express.json({
    limit: "10mb", // Max 10MB per request
  })
);

// 2. CORS: Allow requests from frontend
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" 
      ? "https://yourdomain.com" // Production: specific domain
      : "*", // Development: allow all
    credentials: true, // Allow cookies
  })
);

// 3. Request logging
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  next();
});

/**
 * ROUTES
 * All API routes are under /api
 */
app.use("/api", routes);

/**
 * Health check endpoint
 * Useful for monitoring if server is alive
 */
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

/**
 * 404 handler
 * Catches all requests that don't match any route
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    error: {
      code: "NOT_FOUND",
      path: req.path,
      method: req.method,
    },
    data: null,
  });
});

/**
 * ERROR HANDLER
 * MUST be last!
 * Catches all errors thrown by routes and middlewares
 */
app.use(errorHandler);

export default app;
