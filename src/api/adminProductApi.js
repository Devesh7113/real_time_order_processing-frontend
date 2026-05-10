import { apiClient } from './client'

/**
 * @returns {Promise<import('./types/order').ProductDTO[]>}
 */
export async function fetchAdminProducts() {
  const { data } = await apiClient.get('/api/admin/product')
  return data
}

/**
 * @param {import('./types/product').ProductCreateDTO} payload
 * @returns {Promise<string>}
 */
export async function createAdminProduct(payload) {
  const { data } = await apiClient.post('/api/admin/product/add', payload)
  return typeof data === 'string' ? data : String(data)
}

/**
 * @param {number} id
 * @param {import('./types/product').ProductCreateDTO} payload
 * @returns {Promise<string>}
 */
export async function updateAdminProduct(id, payload) {
  const { data } = await apiClient.put('/api/admin/product/update', payload, {
    params: { id },
  })
  return typeof data === 'string' ? data : String(data)
}

/**
 * @param {number} id
 * @returns {Promise<string>}
 */
export async function deleteAdminProduct(id) {
  const { data } = await apiClient.delete('/api/admin/product/delete', {
    params: { id },
  })
  return typeof data === 'string' ? data : String(data)
}
