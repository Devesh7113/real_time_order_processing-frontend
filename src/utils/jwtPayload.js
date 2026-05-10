/**
 * Decode JWT payload (no signature verification — for UI only; API enforces access).
 * @param {string | null | undefined} token
 * @returns {Record<string, unknown> | null}
 */
export function parseJwtPayload(token) {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const segment = parts[1]
    const padded = segment + '='.repeat((4 - (segment.length % 4)) % 4)
    const base64 = padded.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(base64)
    return JSON.parse(json)
  } catch {
    return null
  }
}

/**
 * @param {string | null | undefined} token
 * @returns {string[]}
 */
export function getRolesFromToken(token) {
  const payload = parseJwtPayload(token)
  if (!payload || !Array.isArray(payload.roles)) return []
  return payload.roles.filter((r) => typeof r === 'string')
}

/**
 * @param {string | null | undefined} token
 * @returns {string}
 */
export function getDisplayNameFromToken(token) {
  const payload = parseJwtPayload(token)
  if (!payload || typeof payload.displayName !== 'string') return ''
  return payload.displayName.trim()
}
