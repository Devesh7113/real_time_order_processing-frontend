/** Indian English: lakh/crore-style grouping for numbers. */
export const APP_LOCALE = 'en-IN'

/** Display times in India Standard Time. */
export const APP_TIME_ZONE = 'Asia/Kolkata'

/**
 * Rupees (₹) with Indian numbering.
 * @param {number | string | null | undefined} value
 */
export function formatRupees(value) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return new Intl.NumberFormat(APP_LOCALE, {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value))
}

/**
 * Whole or decimal quantities with Indian digit grouping.
 * @param {number | string | null | undefined} value
 */
export function formatNumberIN(value) {
  if (value == null || Number.isNaN(Number(value))) return '—'
  return new Intl.NumberFormat(APP_LOCALE, {
    maximumFractionDigits: 20,
  }).format(Number(value))
}

/**
 * Parse API date/time values for display. Java `LocalDateTime` is serialized without a
 * zone; on cloud hosts that wall clock is UTC, so naive ISO strings are read as UTC.
 * @param {string | number | Date | null | undefined} value
 * @returns {Date | null}
 */
export function parseApiDateTime(value) {
  if (value == null || value === '') return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value

  const s = String(value).trim()
  if (!s) return null

  if (/[Zz]$|[+-]\d{2}:\d{2}$|[+-]\d{4}$/.test(s)) {
    const d = new Date(s)
    return Number.isNaN(d.getTime()) ? null : d
  }

  const iso = s.includes('T') ? s : `${s}T00:00:00`
  const d = new Date(`${iso}Z`)
  return Number.isNaN(d.getTime()) ? null : d
}

/**
 * Date/time in Indian locale and IST.
 * @param {string | number | Date | null | undefined} value
 */
export function formatDateTimeIN(value) {
  const d = parseApiDateTime(value)
  if (!d) return value == null || value === '' ? '—' : String(value)
  return d.toLocaleString(APP_LOCALE, {
    timeZone: APP_TIME_ZONE,
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

/**
 * Newest orders first (by `createdAt`).
 * @param {Array<{ createdAt?: string | null }>} orders
 */
export function sortOrdersByCreatedAtDesc(orders) {
  return [...orders].sort((a, b) => {
    const ta = parseApiDateTime(a.createdAt)?.getTime() ?? 0
    const tb = parseApiDateTime(b.createdAt)?.getTime() ?? 0
    return tb - ta
  })
}
