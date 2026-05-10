import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { fetchOrders } from '../api/ordersApi'
import { getErrorMessage, isNetworkOrUnreachableError } from '../api/errorMessage'
import ServerUnavailableNotice from '../components/ServerUnavailableNotice'
import { ORDERS_POLL_INTERVAL_MS } from '../constants/polling'
import { canCustomerEditOrder } from '../utils/orderEditability'
import { formatDateTimeIN, formatRupees } from '../utils/localeFormat'

function IconEye({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function IconPencilSquare({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
      />
    </svg>
  )
}

const actionIconClass =
  'inline-flex h-9 w-9 items-center justify-center rounded-md text-emerald-700 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2'

export default function OrdersPage() {
  const location = useLocation()
  const orderCreatedMessage = location.state?.orderCreatedMessage

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [errorUnreachable, setErrorUnreachable] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState(null)

  const load = useCallback(async (mode = 'full') => {
    const silent = mode === 'silent'
    if (!silent) {
      setError('')
      setErrorUnreachable(false)
      setLoading(true)
    } else {
      setSyncing(true)
    }
    try {
      const data = await fetchOrders()
      setOrders(Array.isArray(data) ? data : [])
      setLastSyncedAt(new Date())
    } catch (e) {
      if (!silent) {
        setErrorUnreachable(isNetworkOrUnreachableError(e))
        setError(getErrorMessage(e, 'Could not load orders.'))
      }
    } finally {
      if (!silent) setLoading(false)
      else setSyncing(false)
    }
  }, [])

  useEffect(() => {
    load('full')
  }, [load])

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') load('silent')
    }, ORDERS_POLL_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [load])

  if (loading) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
        <p className="text-slate-600">Loading…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
        {errorUnreachable ? (
          <ServerUnavailableNotice onRetry={() => load('full')} retrying={loading} />
        ) : (
          <div className="space-y-4">
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {error}
            </p>
            <button
              type="button"
              onClick={() => load('full')}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="mt-1 text-sm text-slate-600">
            Orders you have already placed. Shop from{' '}
            <Link to="/products" className="font-medium text-emerald-700 hover:text-emerald-800">
              Products
            </Link>
            , add items with +, then check out from your cart. This list refreshes in the background.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            {lastSyncedAt ? (
              <span>Last synced: {formatDateTimeIN(lastSyncedAt.toISOString())}</span>
            ) : null}
            {syncing ? <span className="text-emerald-700">Syncing…</span> : null}
            <button
              type="button"
              onClick={() => load('silent')}
              disabled={syncing}
              className="font-medium text-emerald-700 hover:text-emerald-800 disabled:opacity-50"
            >
              Refresh now
            </button>
          </div>
        </div>
      </div>

      {orderCreatedMessage ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
          {orderCreatedMessage}
        </p>
      ) : null}
      {orders.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-slate-600">
          You have no orders yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-600">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Order status</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-mono text-slate-800">{order.id}</td>
                  <td className="px-4 py-3 text-slate-800">{formatRupees(order.totalAmount)}</td>
                  <td className="px-4 py-3 text-slate-700">{order.orderStatus}</td>
                  <td className="px-4 py-3 text-slate-700">{order.paymentStatus}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDateTimeIN(order.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap justify-end gap-1">
                      <Link
                        to={`/orders/${order.id}`}
                        className={actionIconClass}
                        title="View"
                        aria-label="View order (read-only)"
                      >
                        <IconEye className="h-5 w-5" />
                      </Link>
                      {canCustomerEditOrder(order) ? (
                        <Link
                          to={`/orders/${order.id}/edit`}
                          className={actionIconClass}
                          title="Modify"
                          aria-label="Modify order"
                        >
                          <IconPencilSquare className="h-5 w-5" />
                        </Link>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
