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
 * Date/time in Indian locale and IST.
 * @param {string | number | Date | null | undefined} value
 */
export function formatDateTimeIN(value) {
  if (value == null || value === '') return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleString(APP_LOCALE, {
    timeZone: APP_TIME_ZONE,
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
