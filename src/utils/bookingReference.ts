/**
 * FILE: src/utils/bookingReference.ts
 * PURPOSE: Generate unique booking reference codes
 *
 * FORMAT: BK-YYYYMMDD-XXXXXX
 * EXAMPLE: BK-20250307-A3F9K2
 *
 * WHY THIS FORMAT?
 * - BK: Prefix for "Booking"
 * - YYYYMMDD: Date part, helps with sorting and human readability
 * - XXXXXX: Random alphanumeric, ensures uniqueness
 *
 * The combination makes booking references:
 * - Unique (random part)
 * - Readable (date part)
 * - Sortable (date format)
 * - Professional (prefixed with BK)
 */

/**
 * Generate a unique booking reference
 *
 * @returns Booking reference string in format BK-YYYYMMDD-XXXXXX
 *
 * EXAMPLE:
 * const ref = generateBookingReference();
 * // Returns: "BK-20250307-A3F9K2"
 *
 * PROCESS:
 * 1. Get today's date and format as YYYYMMDD
 * 2. Generate 6 random alphanumeric characters
 * 3. Combine as: BK-<date>-<random>
 */
export function generateBookingReference(): string {
  // Get current date
  const now = new Date();

  // Format date as YYYYMMDD
  // padStart ensures single-digit months/days have leading zeros
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const day = String(now.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`; // e.g., "20250307"

  // Generate random alphanumeric string
  // Characters to use: A-Z and 0-9 (36 total)
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomStr = "";

  // Create 6 random characters
  for (let i = 0; i < 6; i++) {
    // Math.random() gives 0-1, multiply by 36 to get 0-35 index
    const randomIndex = Math.floor(Math.random() * chars.length);
    randomStr += chars[randomIndex];
  }

  // Combine all parts
  return `BK-${dateStr}-${randomStr}`;
}
