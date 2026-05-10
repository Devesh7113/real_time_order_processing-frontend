function apiBase() {
  const raw = import.meta.env.VITE_API_BASE_URL
  if (typeof raw === 'string' && raw.trim()) return raw.replace(/\/$/, '')
  return 'http://localhost:8080'
}

/** Relative image paths resolve here; override if files are not on the API host. */
function imageOrigin() {
  const raw = import.meta.env.VITE_IMAGE_CDN_BASE
  if (typeof raw === 'string' && raw.trim()) return raw.replace(/\/$/, '')
  return apiBase()
}

/**
 * Build a usable `img` src from what the API stored.
 *
 * Relative paths (e.g. `office-chair.jpg` or `/uploads/x.png`) are resolved against
 * `VITE_IMAGE_CDN_BASE` if set, otherwise `VITE_API_BASE_URL`, so the browser does not
 * request them from the Vite dev server (which would return `index.html` and trigger
 * ORB: the response must be a real image, not HTML).
 *
 * Absolute `http(s)` and `data:` URLs are returned unchanged.
 */
export function resolveProductImageUrl(url) {
  if (url == null || typeof url !== 'string') return ''
  const t = url.trim()
  if (!t) return ''
  if (t.startsWith('http://') || t.startsWith('https://') || t.startsWith('data:')) return t
  const base = imageOrigin()
  if (t.startsWith('/')) return `${base}${t}`
  return `${base}/${t}`
}
