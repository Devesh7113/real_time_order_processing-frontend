import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  fetchOrderItems,
  fetchOrders,
  fetchProductsForOrderForm,
  updateOrder,
} from '../api/ordersApi'
import { getErrorMessage, isNetworkOrUnreachableError } from '../api/errorMessage'
import ServerUnavailableNotice from '../components/ServerUnavailableNotice'
import { ORDERS_POLL_INTERVAL_MS } from '../constants/polling'
import {
  canCustomerEditOrder,
  canModifyOrderShippingNotes,
  customerEditUsedReason,
  modifyOrderBlockedReason,
} from '../utils/orderEditability'
import { formatDateTimeIN, formatNumberIN, formatRupees } from '../utils/localeFormat'

export default function OrderDetailPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const formId = useId()
  const idNum = Number(orderId)
  const editMode = orderId != null && location.pathname === `/orders/${orderId}/edit`
  const modifySectionRef = useRef(null)
  const didScrollToModifyRef = useRef(false)

  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [errorUnreachable, setErrorUnreachable] = useState(false)

  const [editShipping, setEditShipping] = useState('')
  const [updateError, setUpdateError] = useState('')
  const [updateSubmitting, setUpdateSubmitting] = useState(false)

  const [syncing, setSyncing] = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState(null)

  const [catalog, setCatalog] = useState([])

  const refreshOrder = useCallback(async () => {
    const list = await fetchOrders()
    const summary = list.find((o) => Number(o.id) === idNum) ?? null
    if (summary) setOrder(summary)
    const lineItems = await fetchOrderItems(idNum)
    setItems(Array.isArray(lineItems) ? lineItems : [])
    setLastSyncedAt(new Date())
  }, [idNum])

  useEffect(() => {
    didScrollToModifyRef.current = false
  }, [idNum, editMode])

  useEffect(() => {
    if (!order?.id) return undefined
    let cancelled = false
    fetchProductsForOrderForm()
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setCatalog(data)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [order?.id])

  useEffect(() => {
    if (orderId == null) return
    if (searchParams.get('edit') === '1' && location.pathname === `/orders/${orderId}`) {
      navigate(`/orders/${orderId}/edit`, { replace: true })
    }
  }, [orderId, searchParams, location.pathname, navigate])

  const loadInitial = useCallback(async () => {
    if (orderId == null || Number.isNaN(idNum)) {
      setError('Invalid order id.')
      setErrorUnreachable(false)
      setLoading(false)
      return
    }
    setError('')
    setErrorUnreachable(false)
    setLoading(true)
    try {
      await refreshOrder()
    } catch (e) {
      setErrorUnreachable(isNetworkOrUnreachableError(e))
      setError(getErrorMessage(e, 'Could not load this order.'))
    } finally {
      setLoading(false)
    }
  }, [orderId, idNum, refreshOrder])

  useEffect(() => {
    loadInitial()
  }, [loadInitial])

  useEffect(() => {
    if (loading || error || orderId == null || Number.isNaN(idNum)) return undefined
    const id = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return
      setSyncing(true)
      refreshOrder()
        .catch(() => {})
        .finally(() => setSyncing(false))
    }, ORDERS_POLL_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [loading, error, orderId, idNum, refreshOrder])

  useEffect(() => {
    if (!order) return
    setEditShipping(order.shippingAddress ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps -- field deps only: avoid resetting form when polls change payment/status
  }, [order?.id, order?.shippingAddress])

  useEffect(() => {
    if (didScrollToModifyRef.current || !editMode || !order || !canCustomerEditOrder(order)) return
    requestAnimationFrame(() => {
      modifySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      modifySectionRef.current?.focus?.()
    })
    didScrollToModifyRef.current = true
  }, [order, editMode])

  const productById = useMemo(() => {
    const m = new Map()
    for (const p of catalog) {
      m.set(Number(p.id), p)
    }
    return m
  }, [catalog])

  async function handleUpdate(e) {
    e.preventDefault()
    setUpdateError('')
    if (!order) return

    if (!editMode || !canCustomerEditOrder(order)) {
      setUpdateError(
        modifyOrderBlockedReason(order.orderStatus) ||
          customerEditUsedReason(order) ||
          'This order cannot be updated.',
      )
      return
    }

    const ship = editShipping.trim()
    if (!ship) {
      setUpdateError('Shipping address is required.')
      return
    }

    setUpdateSubmitting(true)
    try {
      await updateOrder({
        id: order.id,
        shippingAddress: ship,
      })
      await refreshOrder()
      navigate(`/orders/${orderId}`, { replace: true })
    } catch (err) {
      setUpdateError(getErrorMessage(err, 'Could not update order.'))
    } finally {
      setUpdateSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <Link
          to="/orders"
          className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
        >
          ← Back to orders
        </Link>
        <p className="text-slate-600">Loading…</p>
      </div>
    )
  }

  if (error || !order) {
    const invalidId = error === 'Invalid order id.'
    return (
      <div className="space-y-6">
        <Link
          to="/orders"
          className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
        >
          ← Back to orders
        </Link>
        {errorUnreachable && !invalidId ? (
          <ServerUnavailableNotice onRetry={loadInitial} retrying={loading} />
        ) : (
          <div className="space-y-4">
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {error || 'Order not found.'}
            </p>
            {!invalidId ? (
              <button
                type="button"
                onClick={() => loadInitial()}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Try again
              </button>
            ) : null}
          </div>
        )}
      </div>
    )
  }

  const canModify = canModifyOrderShippingNotes(order.orderStatus)
  const canEditOnce = canCustomerEditOrder(order)
  const modifyReason = modifyOrderBlockedReason(order.orderStatus)
  const usedEditReason = customerEditUsedReason(order)
  const editingAllowed = editMode && canEditOnce

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            to="/orders"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            ← Back to orders
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Order #{order.id}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            {lastSyncedAt ? (
              <span>Last synced: {formatDateTimeIN(lastSyncedAt.toISOString())}</span>
            ) : null}
            {syncing ? <span className="text-emerald-700">Syncing…</span> : null}
            <button
              type="button"
              onClick={() => {
                setSyncing(true)
                refreshOrder()
                  .catch(() => {})
                  .finally(() => setSyncing(false))
              }}
              disabled={syncing}
              className="font-medium text-emerald-700 hover:text-emerald-800 disabled:opacity-50"
            >
              Refresh now
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {editMode ? (
            <Link
              to={`/orders/${orderId}`}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              View order
            </Link>
          ) : canEditOnce ? (
            <Link
              to={`/orders/${orderId}/edit`}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Edit order
            </Link>
          ) : null}
        </div>
      </div>

      {!canModify ? (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">{modifyReason}</p>
      ) : usedEditReason ? (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">{usedEditReason}</p>
      ) : editingAllowed ? (
        <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
          You have <strong>one</strong> chance to update your shipping address while the order is{' '}
          <strong>PROCESSING</strong>, <strong>CONFIRMED</strong>, or eligible. After you save, it cannot be changed
          again from this screen.
        </p>
      ) : (
        <p className="rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-900">
          You are viewing this order in read-only mode. Choose <strong>Edit order</strong> to use your one-time
          address update if available.
        </p>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-xs font-semibold uppercase text-slate-500">Summary</h2>
        <dl className="mt-2 space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Total</dt>
            <dd className="font-medium text-slate-900">{formatRupees(order.totalAmount)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Order status</dt>
            <dd className="text-slate-800">{order.orderStatus}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Payment</dt>
            <dd className="text-slate-800">{order.paymentStatus}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Created</dt>
            <dd className="text-slate-800">{formatDateTimeIN(order.createdAt)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Updated</dt>
            <dd className="text-slate-800">{formatDateTimeIN(order.updatedAt)}</dd>
          </div>
        </dl>
      </div>

      <section
        id="order-addresses"
        ref={modifySectionRef}
        tabIndex={-1}
        className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm outline-none ring-emerald-500/0 focus-visible:ring-2 sm:p-6"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          {editingAllowed ? 'Update shipping address' : 'Shipping & notes'}
        </h2>
        {editingAllowed ? (
          <p className="mt-1 text-sm text-slate-600">
            Update shipping below. This is your <strong>only</strong> amendment; line items and order total stay the
            same.
          </p>
        ) : (
          <p className="mt-1 text-sm text-slate-600">
            Shipping address and notes as recorded on this order.
            {canEditOnce ? (
              <>
                {' '}
                <Link to={`/orders/${orderId}/edit`} className="font-medium text-emerald-700 hover:text-emerald-800">
                  Edit order
                </Link>{' '}
                to update shipping once.
              </>
            ) : null}
          </p>
        )}

        {editingAllowed ? (
          <form id={formId} onSubmit={handleUpdate} className="mt-4 space-y-4">
            {updateError ? (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
                {updateError}
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
                value={editShipping}
                onChange={(e) => setEditShipping(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </div>
            <button
              type="submit"
              disabled={updateSubmitting}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {updateSubmitting ? 'Saving…' : 'Save shipping (one time only)'}
            </button>
          </form>
        ) : (
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="font-medium text-slate-700">Shipping address</dt>
              <dd className="mt-1 whitespace-pre-wrap text-slate-800">{order.shippingAddress || '—'}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-700">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap text-slate-800">{order.notes || '—'}</dd>
            </div>
          </dl>
        )}
      </section>

      <div>
        <h2 className="text-lg font-semibold text-slate-900">Line items</h2>
        {items.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">No line items returned.</p>
        ) : (
          <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-600">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Unit price</th>
                  <th className="px-4 py-3">Line total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((row) => (
                  <tr key={row.id ?? `${row.productId}-${row.quantity}`}>
                    <td className="px-4 py-3 text-slate-800">
                      {productById.get(Number(row.productId))?.name ?? 'Product'}
                    </td>
                    <td className="px-4 py-3">{formatNumberIN(row.quantity)}</td>
                    <td className="px-4 py-3">{formatRupees(row.price)}</td>
                    <td className="px-4 py-3">
                      {formatRupees(
                        row.price != null && row.quantity != null
                          ? Number(row.price) * Number(row.quantity)
                          : null
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
