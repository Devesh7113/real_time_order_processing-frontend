import { apiClient } from './client'

/**
 * Products exposed under the orders controller (for building a cart / order form).
 * @returns {Promise<import('./types/order').ProductDTO[]>}
 */
export async function fetchProductsForOrderForm() {
  const { data } = await apiClient.get('/api/orders/products')
  return data
}

/**
 * Current user’s orders (backend filters by JWT user).
 * @returns {Promise<import('./types/order').OrderDTO[]>}
 */
export async function fetchOrders() {
  const { data } = await apiClient.get('/api/orders')
  return data
}

/**
 * Line items for one order. `orderId` is the order’s `id` from {@link fetchOrders}.
 * @param {number} orderId
 * @returns {Promise<import('./types/order').OrderItemDTO[]>}
 */
export async function fetchOrderItems(orderId) {
  const { data } = await apiClient.get('/api/orders/items', {
    params: { orderId },
  })
  return data
}

/**
 * @param {import('./types/order').OrderCreateDTO} payload
 * @returns {Promise<{ message: string, orderId: number }>}
 */
export async function createOrder(payload) {
  const { data } = await apiClient.post('/api/orders', payload)
  if (data && typeof data === 'object' && data.orderId != null) {
    return {
      message: typeof data.message === 'string' ? data.message : '',
      orderId: Number(data.orderId),
    }
  }
  return { message: typeof data === 'string' ? data : String(data ?? ''), orderId: NaN }
}

/**
 * @param {import('./types/order').OrderUpdateDTO} payload
 * @returns {Promise<string>}
 */
export async function updateOrder(payload) {
  const { data } = await apiClient.put('/api/orders', payload)
  return typeof data === 'string' ? data : String(data)
}
