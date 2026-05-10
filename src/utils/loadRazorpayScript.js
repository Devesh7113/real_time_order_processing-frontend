const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

/**
 * Loads Razorpay Checkout.js once. Safe to call multiple times.
 * @returns {Promise<void>}
 */
export function loadRazorpayScript() {
  if (typeof window !== 'undefined' && window.Razorpay) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-razorpay-checkout]')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay Checkout.')))
      return
    }

    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.dataset.razorpayCheckout = '1'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay Checkout.'))
    document.body.appendChild(script)
  })
}
