/**
 * FILE: src/utils/date.ts
 * PURPOSE: Date calculation utilities for booking system
 *
 * USED FOR:
 * - Calculating number of nights between check-in and check-out
 * - Checking if two date ranges overlap (to detect room conflicts)
 */

/**
 * Calculate number of nights between check-in and check-out
 *
 * @param checkIn - Check-in date (Date object or string "YYYY-MM-DD")
 * @param checkOut - Check-out date (Date object or string "YYYY-MM-DD")
 * @returns Number of nights (integer)
 *
 * LOGIC:
 * - Difference in milliseconds / (1000 * 60 * 60 * 24) = days
 * - We round to handle timezone edge cases
 *
 * EXAMPLE:
 * calculateNights("2025-03-07", "2025-03-10")
 * // 3 nights (check in Mar 7, check out Mar 10)
 *
 * IMPORTANT:
 * - Standard hotel convention: check-out date is NOT included
 * - A 3-night stay: nights 1, 2, 3 (then check out on day 4)
 */
export function calculateNights(
  checkIn: Date | string,
  checkOut: Date | string
): number {
  // Convert strings to Date objects if needed
  const checkInDate = typeof checkIn === "string" ? new Date(checkIn) : checkIn;
  const checkOutDate = typeof checkOut === "string" ? new Date(checkOut) : checkOut;

  // Calculate difference in milliseconds
  const diffMs = checkOutDate.getTime() - checkInDate.getTime();

  // Convert milliseconds to days
  // 1000 ms/s * 60 s/min * 60 min/hr * 24 hr/day = 86400000 ms/day
  const nights = Math.round(diffMs / (1000 * 60 * 60 * 24));

  return nights;
}

/**
 * Check if two date ranges overlap
 *
 * @param aCheckIn - First booking check-in date
 * @param aCheckOut - First booking check-out date
 * @param bCheckIn - Second booking check-in date
 * @param bCheckOut - Second booking check-out date
 * @returns true if ranges overlap, false if they don't
 *
 * LOGIC:
 * Two ranges overlap if:
 * - Start of range A < End of range B AND
 * - Start of range B < End of range A
 *
 * EXAMPLES:
 * A: Mar 1 - Mar 5
 * B: Mar 3 - Mar 7
 * → OVERLAP (true)
 *
 * A: Mar 1 - Mar 5
 * B: Mar 5 - Mar 10
 * → NO OVERLAP (false) - B starts when A ends
 *
 * A: Mar 1 - Mar 5
 * B: Mar 6 - Mar 10
 * → NO OVERLAP (false) - completely separate
 */
export function datesOverlap(
  aCheckIn: Date | string,
  aCheckOut: Date | string,
  bCheckIn: Date | string,
  bCheckOut: Date | string
): boolean {
  // Convert strings to Date objects if needed
  const aIn = typeof aCheckIn === "string" ? new Date(aCheckIn) : aCheckIn;
  const aOut = typeof aCheckOut === "string" ? new Date(aCheckOut) : aCheckOut;
  const bIn = typeof bCheckIn === "string" ? new Date(bCheckIn) : bCheckIn;
  const bOut = typeof bCheckOut === "string" ? new Date(bCheckOut) : bCheckOut;

  // Check overlap condition: A starts before B ends AND B starts before A ends
  return aIn < bOut && bIn < aOut;
}
