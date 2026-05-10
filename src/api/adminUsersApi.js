import { apiClient } from './client'

/**
 * @param {string} q At least 2 characters (partial email match).
 * @returns {Promise<Array<{ id: number, email: string, username: string | null, roles: string }>>}
 */
export async function searchAdminUsers(q) {
  const { data } = await apiClient.get('/api/admin/users/search', {
    params: { q },
  })
  return Array.isArray(data) ? data : []
}

/**
 * @param {string} email Exact email of an existing user.
 * @returns {Promise<string>}
 */
export async function grantAdminByEmail(email) {
  const { data } = await apiClient.post('/api/admin/users/grant-admin', { email })
  return typeof data === 'string' ? data : String(data ?? '')
}
