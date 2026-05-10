const KEY = 'rtop_cart_v1'

/** @returns {Array<{ productId: number, name: string, price: number, quantity: number, imageUrl: string | null }>} */
export function loadCart() {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/** @param {ReturnType<typeof loadCart>} items */
export function saveCart(items) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(items))
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearCartStorage() {
  sessionStorage.removeItem(KEY)
}
