/**
 * FILE: src/server.ts
 * PURPOSE: Start the Express server
 *
 * WHY SEPARATE FILE?
 * - app.ts exports app without starting it
 * - Tests can import app without starting the server
 * - server.ts starts the server for production/development
 *
 * WORKFLOW:
 * 1. Import app from app.ts
 * 2. Import env config
 * 3. Start server on env.PORT
 * 4. Log startup information
 */

import app from "@/app";
import { env } from "@/config/env";
import { logger } from "@/utils/logger";

/**
 * Start the server
 *
 * PORT: From environment variable (default: 3000)
 * NODE_ENV: From environment variable (development, staging, production)
 */
const server = app.listen(env.PORT, () => {
  logger.info("✅ Server started successfully", {
    port: env.PORT,
    node_env: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });

  logger.info("🌐 API is running at:", {
    base_url: `http://localhost:${env.PORT}`,
    api_root: `http://localhost:${env.PORT}/api`,
    health_check: `http://localhost:${env.PORT}/health`,
  });
});

/**
 * Graceful shutdown handling
 * Properly close server when process receives SIGTERM or SIGINT
 */
process.on("SIGTERM", () => {
  logger.warn("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.warn("SIGINT signal received: closing HTTP server");
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
});

/**
 * Handle unhandled rejections
 */
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", {
    promise: String(promise),
    reason: String(reason),
  });
  process.exit(1);
});

/**
 * Handle uncaught exceptions
 */
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

export default server;
