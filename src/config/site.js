/**
 * Shown in the header and browser tab.
 * For the tab label before JS loads, keep `index.html` <title> in sync.
 */
export const SITE_NAME = 'D Store'

/** Split "D Store" → badge letter + remainder. Single-word names use no badge. */
export function siteBrandParts() {
  const t = SITE_NAME.trim()
  const space = t.indexOf(' ')
  if (space > 0) {
    return { badge: t.slice(0, 1).toUpperCase(), rest: t.slice(space + 1).trim() }
  }
  if (!t) return { badge: '', rest: '' }
  return { badge: '', rest: '' }
}
