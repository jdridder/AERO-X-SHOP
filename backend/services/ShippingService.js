/**
 * ShippingService — calculates estimated delivery windows.
 *
 * Rules:
 *  • 2:00 PM local-time cutoff:  orders placed at or after 14:00 count from the
 *    next business day.  Weekend orders also count from the next business day.
 *  • Business days exclude Saturday (6) and Sunday (0).
 *  • Region tiers:
 *      DE           → 2–4 business days
 *      EU           → 3–7 business days
 *      International → 7–14 business days
 */

const CUTOFF_HOUR = 14; // 14:00 local time

/** ISO 3166-1 alpha-2 codes for EU member states (excluding DE, handled separately). */
const EU_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL',
  'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
]);

/**
 * Advance a date forward until it lands on a business day (Mon–Fri).
 * @param {Date} date
 * @returns {Date}  (mutates in place for efficiency)
 */
function toNextBusinessDay(date) {
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}

/**
 * Add N business days to a date, skipping weekends.
 * @param {Date}   date
 * @param {number} days
 * @returns {Date}  New Date instance (original is not mutated).
 */
function addBusinessDays(date, days) {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    if (result.getDay() !== 0 && result.getDay() !== 6) added++;
  }
  return result;
}

/**
 * Resolve the shipping tier for a destination address.
 * @param {Object} shippingAddress - Must contain { country: 'DE' | 'FR' | ... }
 * @returns {{ tier: string, minDays: number, maxDays: number }}
 */
function resolveRegion(shippingAddress) {
  const country = (shippingAddress?.country ?? '').toUpperCase().trim();
  if (country === 'DE') return { tier: 'DE',            minDays: 2,  maxDays: 4  };
  if (EU_COUNTRIES.has(country)) return { tier: 'EU',   minDays: 3,  maxDays: 7  };
  return                                { tier: 'INTERNATIONAL', minDays: 7, maxDays: 14 };
}

/**
 * Format a Date as "Mon, 24 Feb" (English short form).
 * @param {Date} d
 * @returns {string}
 */
function fmtDate(d) {
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day:     'numeric',
    month:   'short',
  });
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate the estimated delivery window for an order.
 *
 * @param {Object} shippingAddress          - Must include { country: string }.
 * @param {Date}   [orderDate=new Date()]   - Timestamp of order placement.
 * @returns {{
 *   tier:            string,
 *   minDays:         number,
 *   maxDays:         number,
 *   earliestArrival: Date,
 *   latestArrival:   Date,
 *   displayRange:    string,
 *   cutoffApplied:   boolean,
 * }}
 */
export function calculateEstimatedArrival(shippingAddress, orderDate = new Date()) {
  const { tier, minDays, maxDays } = resolveRegion(shippingAddress);

  const hour      = orderDate.getHours();
  const dayOfWeek = orderDate.getDay();   // 0 = Sun, 6 = Sat
  const isWeekend    = dayOfWeek === 0 || dayOfWeek === 6;
  const isAfterCutoff = hour >= CUTOFF_HOUR;
  const cutoffApplied = isAfterCutoff || isWeekend;

  // Start counting from the effective dispatch date
  const startDate = new Date(orderDate);
  if (cutoffApplied) {
    // Advance at least one calendar day, then find the next business day
    startDate.setDate(startDate.getDate() + 1);
    toNextBusinessDay(startDate);
  } else {
    // Same-day dispatch — ensure today itself is a business day
    toNextBusinessDay(startDate);
  }

  const earliestArrival = addBusinessDays(startDate, minDays);
  const latestArrival   = addBusinessDays(startDate, maxDays);

  return {
    tier,
    minDays,
    maxDays,
    earliestArrival,
    latestArrival,
    displayRange: `${fmtDate(earliestArrival)} – ${fmtDate(latestArrival)}`,
    cutoffApplied,
  };
}
