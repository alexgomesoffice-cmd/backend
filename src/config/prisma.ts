/**
 * FILE: src/config/prisma.ts
 * PURPOSE: Singleton PrismaClient instance
 *
 * WHY A SINGLETON?
 * - Creating multiple PrismaClient instances causes memory leaks
 * - Database connections are expensive resources
 * - One instance per app is the correct pattern
 * - This file ensures only ONE PrismaClient is created, no matter how many imports
 *
 * HOW IT WORKS:
 * 1. Check if globalThis already has our prismaClient
 * 2. If yes, reuse it (already instantiated)
 * 3. If no, create a new instance and attach to globalThis
 * 4. Always return the same instance
 *
 * EXAMPLE:
 * import { prisma } from '@/config/prisma';
 * const users = await prisma.end_users.findMany();
 */

import { PrismaClient } from "@prisma/client";

/**
 * Declare global type for our prismaClient
 * This allows TypeScript to understand that globalThis.prismaClient exists
 * This is a TypeScript-only declaration (compiled away in production)
 */
declare global {
  // eslint-disable-next-line no-var
  var prismaClient: PrismaClient | undefined;
}

/**
 * Get or create the singleton PrismaClient
 *
 * FLOW:
 * 1. First time: globalThis.prismaClient is undefined
 *    → Create new PrismaClient()
 *    → Store in globalThis.prismaClient
 *    → Return it
 *
 * 2. Every other time: globalThis.prismaClient already exists
 *    → Skip creation
 *    → Return existing instance
 *
 * RESULT: Only one PrismaClient instance for entire app
 */
const prismaClient = globalThis.prismaClient || new PrismaClient();

// In development, store the instance in globalThis to survive hot reloads
if (process.env.NODE_ENV !== "production") {
  globalThis.prismaClient = prismaClient;
}

/**
 * Log Prisma queries in development
 * Helps debug database operations
 */
if (process.env.NODE_ENV === "development") {
  prismaClient.$on("query" as never, (e: any) => {
    console.log(`[PRISMA QUERY] ${e.query}`);
    console.log(`[PRISMA PARAMS] ${e.params}`);
    console.log(`[PRISMA DURATION] ${e.duration}ms\n`);
  });
}

export { prismaClient as prisma };
