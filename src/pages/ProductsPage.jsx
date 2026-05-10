import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchProductsForOrderForm } from '../api/ordersApi'
import { getErrorMessage, isNetworkOrUnreachableError } from '../api/errorMessage'
import ProductImage from '../components/ProductImage'
import ServerUnavailableNotice from '../components/ServerUnavailableNotice'
import { formatRupees } from '../utils/localeFormat'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'

export default function ProductsPage() {
  const { isAdmin } = useAuth()
  const { items, addToCart, setQuantity, itemCount } = useCart()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [errorIsUnreachable, setErrorIsUnreachable] = useState(false)

  const loadProducts = useCallback(async () => {
    setError('')
    setErrorIsUnreachable(false)
    setLoading(true)
    try {
      const data = await fetchProductsForOrderForm()
      setProducts(Array.isArray(data) ? data : [])
    } catch (e) {
      setErrorIsUnreachable(isNetworkOrUnreachableError(e))
      setError(getErrorMessage(e, 'Could not load products.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  if (loading) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">Products</h1>
        <p className="text-slate-600">Loading…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Products</h1>
        {errorIsUnreachable ? (
          <ServerUnavailableNotice onRetry={loadProducts} retrying={loading} />
        ) : (
          <div className="space-y-4">
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {error}
            </p>
            <button
              type="button"
              onClick={() => loadProducts()}
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
        <h1 className="text-2xl font-bold text-slate-900">Products</h1>
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <span>View cart</span>
          {itemCount > 0 ? (
            <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          ) : null}
        </Link>
      </div>

      {isAdmin ? (
        <p className="text-sm text-slate-500">
          Catalogue managers:{' '}
          <Link to="/admin/products" className="font-medium text-emerald-700 hover:text-emerald-800">
            Admin product tools
          </Link>
          .
        </p>
      ) : null}

      {products.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-slate-600">
          No products yet.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const productId = Number(p.id)
            const line = Number.isFinite(productId)
              ? items.find((x) => x.productId === productId)
              : undefined
            return (
            <li
              key={p.id}
              className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
            >
              {p.imageUrl ? (
                <div className="relative h-36 shrink-0 overflow-hidden bg-slate-100 sm:h-40">
                  <ProductImage
                    src={p.imageUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-36 shrink-0 items-center justify-center bg-slate-100 text-sm text-slate-400 sm:h-40">
                  No image
                </div>
              )}
              <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="font-semibold text-slate-900">{p.name}</h2>
                  {p.category ? (
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {p.category}
                    </span>
                  ) : null}
                </div>
                {p.description ? (
                  <p className="line-clamp-3 text-sm text-slate-600">{p.description}</p>
                ) : null}
                <div className="mt-auto flex items-end justify-between gap-2 border-t border-slate-100 pt-3">
                  <dl className="text-sm">
                    <dt className="text-slate-500">Price</dt>
                    <dd className="font-medium text-slate-900">{formatRupees(p.price)}</dd>
                  </dl>
                  {line ? (
                    <div className="flex shrink-0 items-center rounded-md border border-slate-200 bg-white shadow-sm">
                      <button
                        type="button"
                        aria-label={`Decrease ${p.name} quantity`}
                        className="px-2.5 py-1 text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => setQuantity(line.productId, line.quantity - 1)}
                      >
                        −
                      </button>
                      <span className="min-w-[2rem] px-1 text-center text-sm font-medium tabular-nums text-slate-900">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase ${p.name} quantity`}
                        className="px-2.5 py-1 text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => setQuantity(line.productId, line.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => addToCart(p)}
                      disabled={p.price == null || Number(p.price) < 0}
                      className="grid size-9 shrink-0 place-items-center rounded-full border-0 bg-emerald-600 p-0 text-base font-semibold leading-none text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Add ${p.name} to cart`}
                    >
                      <span className="select-none" aria-hidden>
                        +
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
