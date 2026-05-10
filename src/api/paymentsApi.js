import { apiClient } from './client'

/**
 * Server-created Razorpay order + public key for Checkout.js.
 * @param {number} orderId Internal order id from {@link import('./ordersApi').createOrder}.
 * @returns {Promise<{ keyId: string, razorpayOrderId: string, amount: number, currency: string }>}
 */
export async function prepareRazorpayCheckout(orderId) {
  const { data } = await apiClient.post('/api/orders/razorpay/checkout-options', { orderId })
  return data
}

/**
 * Verifies the Razorpay signature server-side and marks the order paid.
 * @param {{ orderId: number, razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string }} payload
 * @returns {Promise<string>}
 */
export async function verifyRazorpayPayment(payload) {
  const { data } = await apiClient.post('/api/orders/razorpay/verify', payload)
  return typeof data === 'string' ? data : String(data ?? '')
}
