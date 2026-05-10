/**
 * True when the request never reached the app (API down, DNS, offline, CORS block, etc.).
 * @param {unknown} error
 */
export function isNetworkOrUnreachableError(error) {
  if (!error || typeof error !== 'object') return false
  const e = /** @type {{ code?: string, message?: string, response?: unknown, request?: unknown }} */ (
    error
  )
  if (e.code === 'ERR_NETWORK' || e.message === 'Network Error') return true
  if (!e.response && e.request) return true
  return false
}

/**
 * Best-effort message from Axios errors, including Spring `Response`-style JSON
 * (`errors` array or `message`) and common HTTP statuses.
 */
export function getErrorMessage(error, fallback = 'Something went wrong.') {
  if (!error) return fallback

  if (isNetworkOrUnreachableError(error)) {
    return "We couldn't connect to the store. Please try again in a moment."
  }

  const status = error.response?.status
  const data = error.response?.data

  if (typeof data === 'string' && data.trim()) return data.trim()

  if (data != null && typeof data === 'object') {
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const parts = data.errors.filter((e) => typeof e === 'string' && e.trim())
      if (parts.length > 0) return parts.join(' ')
    }
    if (typeof data.message === 'string' && data.message.trim()) return data.message.trim()
  }

  if (status === 401) return 'Sign in again — your session may have expired.'
  if (status === 403) return 'You do not have permission for this action.'
  if (status === 404) return 'The requested resource was not found.'

  return fallback
}
