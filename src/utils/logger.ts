/**
 * FILE: src/utils/logger.ts
 * PURPOSE: Simple logging wrapper
 *
 * WHY A WRAPPER?
 * - Currently uses console.log/warn/error
 * - Can be swapped to Winston, Pino, or Bunyan later
 * - All logging goes through one place (easy to change later)
 * - Adds timestamps and formatting
 *
 * USAGE:
 * import { logger } from '@/utils/logger';
 * logger.info('User logged in', { userId: 42 });
 * logger.error('Database error', err);
 *
 * NO CHANGES needed elsewhere if we switch logging libraries
 */

import { env } from "@/config/env";

/**
 * Log levels in order of severity
 * If LOG_LEVEL=debug, show all (debug, info, warn, error)
 * If LOG_LEVEL=info, show info and above (info, warn, error)
 * If LOG_LEVEL=warn, show warnings and above (warn, error)
 * If LOG_LEVEL=error, show only errors
 */
const logLevels = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Current log level from environment (default: debug)
const currentLevel = logLevels[env.LOG_LEVEL as keyof typeof logLevels] ?? 0;

/**
 * Get current timestamp in ISO format
 * Example: 2025-03-07T10:30:45.123Z
 */
function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Format log message with metadata
 *
 * @param level - Log level (debug, info, warn, error)
 * @param message - Main log message
 * @param metadata - Optional additional data (objects, errors, etc.)
 */
function formatLog(level: string, message: string, metadata?: any): void {
  const timestamp = getTimestamp();
  const levelUpper = level.toUpperCase();

  if (metadata instanceof Error) {
    // Special handling for errors
    console.log(`[${timestamp}] [${levelUpper}] ${message}`);
    console.log(`  Error: ${metadata.message}`);
    console.log(`  Stack: ${metadata.stack}`);
  } else if (metadata) {
    // Log with metadata object
    console.log(`[${timestamp}] [${levelUpper}] ${message}`, metadata);
  } else {
    // Simple message
    console.log(`[${timestamp}] [${levelUpper}] ${message}`);
  }
}

/**
 * Logger object with methods for different severity levels
 *
 * EXAMPLE USAGE:
 * logger.debug('Starting request', { method: 'GET', path: '/api/users' });
 * logger.info('User created', { userId: 42, email: 'user@example.com' });
 * logger.warn('Old API version used', { version: 'v1' });
 * logger.error('Database error', error);
 */
export const logger = {
  /**
   * Debug: Very detailed info, useful during development
   * Only shown if LOG_LEVEL=debug
   */
  debug: (message: string, metadata?: any) => {
    if (currentLevel <= logLevels.debug) {
      formatLog("debug", message, metadata);
    }
  },

  /**
   * Info: General informational messages
   * Shown if LOG_LEVEL=debug or info
   */
  info: (message: string, metadata?: any) => {
    if (currentLevel <= logLevels.info) {
      formatLog("info", message, metadata);
    }
  },

  /**
   * Warn: Warning messages for unexpected but recoverable situations
   * Shown if LOG_LEVEL=debug, info, or warn
   */
  warn: (message: string, metadata?: any) => {
    if (currentLevel <= logLevels.warn) {
      formatLog("warn", message, metadata);
    }
  },

  /**
   * Error: Error messages for serious problems
   * Always shown (even if LOG_LEVEL=error)
   */
  error: (message: string, metadata?: any) => {
    if (currentLevel <= logLevels.error) {
      formatLog("error", message, metadata);
    }
  },
};
