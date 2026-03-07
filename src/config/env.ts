/**
 * FILE: src/config/env.ts
 * PURPOSE: Load and validate environment variables from .env file
 *
 * This file is the SINGLE SOURCE OF TRUTH for all environment variables.
 * NEVER use process.env directly anywhere else in the project.
 * Always import { env } from '@/config/env' instead.
 *
 * EXAMPLE:
 * import { env } from '@/config/env';
 * const port = env.PORT;  // Always use env.PORT, not process.env.PORT
 */

import "dotenv/config";

/**
 * Load and validate environment variables from .env file
 * Throws an error if any required variable is missing
 *
 * @throws Error if required environment variable is missing
 */
function getEnvVariable(key: string, required: boolean = true): string {
  const value = process.env[key];

  // If required but not found, throw error immediately
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  // If optional and not found, return empty string
  if (!required && !value) {
    return "";
  }

  return value ?? "";
}

/**
 * Exported environment configuration object
 * All values are validated at module load time
 * If any required variable is missing, the entire app fails to start
 *
 * VARIABLES:
 * - DATABASE_URL: MySQL connection string (required)
 * - JWT_SECRET: Secret key for signing JWT tokens (required)
 * - JWT_EXPIRES_IN: Token expiration time, e.g., "7d" (required)
 * - PORT: Server port number (required)
 * - NODE_ENV: Environment type: development, staging, production (required)
 * - LOG_LEVEL: Logging verbosity: debug, info, warn, error (required)
 */
export const env = {
  // DATABASE
  DATABASE_URL: getEnvVariable("DATABASE_URL", true),

  // JWT / AUTH
  JWT_SECRET: getEnvVariable("JWT_SECRET", true),
  JWT_EXPIRES_IN: getEnvVariable("JWT_EXPIRES_IN", true),

  // SERVER
  PORT: parseInt(getEnvVariable("PORT", true), 10),
  NODE_ENV: getEnvVariable("NODE_ENV", true) as "development" | "staging" | "production",

  // LOGGING
  LOG_LEVEL: getEnvVariable("LOG_LEVEL", true) as "debug" | "info" | "warn" | "error",
};

/**
 * Validate on startup
 * This runs immediately when the module is imported
 */
if (isNaN(env.PORT)) {
  throw new Error(`❌ PORT must be a valid number, got: ${process.env.PORT}`);
}

if (!["development", "staging", "production"].includes(env.NODE_ENV)) {
  throw new Error(
    `❌ NODE_ENV must be one of: development, staging, production. Got: ${env.NODE_ENV}`
  );
}

if (!["debug", "info", "warn", "error"].includes(env.LOG_LEVEL)) {
  throw new Error(
    `❌ LOG_LEVEL must be one of: debug, info, warn, error. Got: ${env.LOG_LEVEL}`
  );
}

console.log(`✅ Environment loaded successfully`);
console.log(`   NODE_ENV: ${env.NODE_ENV}`);
console.log(`   PORT: ${env.PORT}`);
console.log(`   LOG_LEVEL: ${env.LOG_LEVEL}`);
