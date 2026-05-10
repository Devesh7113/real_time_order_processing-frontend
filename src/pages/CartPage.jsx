import { Link } from 'react-router-dom'
import ProductImage from '../components/ProductImage'
import { useCart } from '../hooks/useCart'
import { formatRupees } from '../utils/localeFormat'

export default function CartPage() {
  const { items, setQuantity, removeFromCart, totalAmount, itemCount } = useCart()

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Cart</h1>
        <p className="rounded-lg border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-slate-600">
          Your cart is empty.{' '}
          <Link to="/products" className="font-medium text-emerald-700 hover:text-emerald-800">
            Browse products
          </Link>{' '}
          and use the + button to add items.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Cart</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <ul className="space-y-3 lg:col-span-2">
          {items.map((line) => (
            <li
              key={line.productId}
              className="flex gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-slate-100">
                {line.imageUrl ? (
                  <ProductImage
                    src={line.imageUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-slate-400">
                    No image
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">{line.name}</p>
                <p className="text-sm text-slate-600">{formatRupees(line.price)} each</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <div className="flex items-center rounded-md border border-slate-200">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      className="px-2.5 py-1 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => setQuantity(line.productId, line.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="min-w-[2rem] px-1 text-center text-sm font-medium tabular-nums">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      className="px-2.5 py-1 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => setQuantity(line.productId, line.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(line.productId)}
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm text-slate-500">Line total</p>
                <p className="font-semibold text-slate-900">
                  {formatRupees(line.price * line.quantity)}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Order summary</h2>
          <p className="mt-1 text-sm text-slate-600">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
          <div className="mt-4 flex items-baseline justify-between border-t border-slate-100 pt-4">
            <span className="text-base font-semibold text-slate-900">Total billed</span>
            <span className="text-xl font-bold text-emerald-800">{formatRupees(totalAmount)}</span>
          </div>
          <Link
            to="/checkout"
            className="mt-5 block w-full rounded-md bg-emerald-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Proceed to checkout
          </Link>
          <Link
            to="/products"
            className="mt-3 block w-full text-center text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  )
}
