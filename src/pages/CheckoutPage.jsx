import { useId, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { createOrder } from '../api/ordersApi'
import { prepareRazorpayCheckout, verifyRazorpayPayment } from '../api/paymentsApi'
import { getErrorMessage } from '../api/errorMessage'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { SITE_NAME } from '../config/site'
import { formatRupees } from '../utils/localeFormat'
import { loadRazorpayScript } from '../utils/loadRazorpayScript'

export default function CheckoutPage() {
  const formId = useId()
  const navigate = useNavigate()
  const { items, totalAmount, clearCart } = useCart()
  const { user } = useAuth()

  const [shippingAddress, setShippingAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (items.length === 0) {
    return <Navigate to="/cart" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')

    if (!shippingAddress.trim()) {
      setSubmitError('Please enter a shipping address.')
      return
    }

    const orderItems = items.map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
      price: line.price,
    }))

    const ship = shippingAddress.trim()
    setSubmitting(true)
    try {
      const created = await createOrder({
        orderItems,
        shippingAddress: ship,
        notes: notes.trim() || undefined,
      })

      if (!Number.isFinite(created.orderId)) {
        setSubmitError('Order was created but no order id was returned.')
        return
      }

      const opts = await prepareRazorpayCheckout(created.orderId)
      await loadRazorpayScript()
      if (!window.Razorpay) {
        throw new Error('Razorpay Checkout failed to load. Please refresh and try again.')
      }

      await new Promise((resolve, reject) => {
        const options = {
          key: opts.keyId,
          amount: opts.amount,
          currency: opts.currency || 'INR',
          order_id: opts.razorpayOrderId,
          name: SITE_NAME,
          description: `Order #${created.orderId}`,
          prefill: user?.email ? { email: user.email } : undefined,
          handler: async (response) => {
            try {
              await verifyRazorpayPayment({
                orderId: created.orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              })
              resolve(response)
            } catch (verifyErr) {
              reject(verifyErr)
            }
          },
          modal: {
            ondismiss: () => reject(new Error('Payment window closed.')),
          },
        }

        const rz = new window.Razorpay(options)
        rz.on('payment.failed', (fail) => {
          const desc = fail?.error?.description || fail?.error?.reason
          reject(new Error(desc ? String(desc) : 'Payment failed.'))
        })
        rz.open()
      })

      clearCart()
      navigate('/orders', {
        replace: true,
        state: {
          orderCreatedMessage: `${created.message} Payment completed.`,
        },
      })
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Could not place order.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/cart"
          className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
        >
          ← Back to cart
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Checkout</h1>
        <p className="mt-1 text-sm text-slate-600">
          Confirm your address. Total:{' '}
          <span className="font-semibold text-slate-800">{formatRupees(totalAmount)}</span>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <form
          id={formId}
          onSubmit={handleSubmit}
          className="space-y-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:col-span-2"
        >
          {submitError ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {submitError}
            </p>
          ) : null}

          <div>
            <label htmlFor={`${formId}-ship`} className="block text-sm font-medium text-slate-700">
              Shipping address
            </label>
            <textarea
              id={`${formId}-ship`}
              required
              rows={3}
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </div>
          <div>
            <label htmlFor={`${formId}-notes`} className="block text-sm font-medium text-slate-700">
              Notes (optional)
            </label>
            <textarea
              id={`${formId}-notes`}
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </div>

          <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {submitting ? 'Placing order…' : 'Place order'}
            </button>
            <Link
              to="/cart"
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>
          </div>
        </form>

        <aside className="h-fit rounded-xl border border-slate-200 bg-slate-50 p-5 lg:sticky lg:top-4">
          <h2 className="text-sm font-semibold text-slate-700">In your cart</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {items.map((line) => (
              <li key={line.productId} className="flex justify-between gap-2">
                <span className="min-w-0 truncate">
                  {line.name} × {line.quantity}
                </span>
                <span className="shrink-0 tabular-nums">
                  {formatRupees(line.price * line.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-slate-200 pt-4">
            <div className="flex justify-between text-base font-semibold text-slate-900">
              <span>Total</span>
              <span className="text-emerald-800">{formatRupees(totalAmount)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
