/**
 * FILE: src/utils/pagination.ts
 * PURPOSE: Parse and validate pagination parameters from query strings
 *
 * USED FOR:
 * - List endpoints: GET /api/hotels?page=2&limit=10
 * - Converts query parameters to database SKIP and TAKE
 *
 * HOW IT WORKS:
 * - Query has page and limit (user-friendly)
 * - Database needs skip and take (technical)
 * - We convert: skip = (page - 1) * limit
 */

/**
 * Pagination parameters returned by parsePagination
 */
export interface PaginationParams {
  page: number; // Which page (1-based: 1, 2, 3, ...)
  limit: number; // How many items per page
  skip: number; // How many items to skip (for database query)
}

/**
 * Parse and validate pagination query parameters
 *
 * @param query - Express query object (req.query)
 * @returns { page, limit, skip } object
 *
 * DEFAULTS:
 * - page: 1 (first page)
 * - limit: 10 (10 items per page)
 * - Maximum limit: 100 (prevent huge queries)
 *
 * EXAMPLE:
 * URL: /api/hotels?page=2&limit=5
 * Query: { page: "2", limit: "5" }
 * Returns: { page: 2, limit: 5, skip: 5 }
 *
 * PAGINATION CALCULATION:
 * page=1, limit=10 → skip=0 (items 1-10)
 * page=2, limit=10 → skip=10 (items 11-20)
 * page=3, limit=10 → skip=20 (items 21-30)
 * Formula: skip = (page - 1) * limit
 */
export function parsePagination(query: Record<string, any>): PaginationParams {
  // Parse page from query string
  // parseInt converts "2" to 2, or returns default 1
  const page = Math.max(1, parseInt(query.page as string, 10) || 1);

  // Parse limit from query string
  // Cap at 100 to prevent huge queries (e.g., limit=1000000 is bad)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string, 10) || 10));

  // Calculate skip for database
  // Example: page 2, limit 10 → skip 10 items (start at item 11)
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
}
