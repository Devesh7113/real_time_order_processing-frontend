import { useCallback, useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  createAdminProduct,
  deleteAdminProduct,
  fetchAdminProducts,
  updateAdminProduct,
} from '../api/adminProductApi'
import { getErrorMessage, isNetworkOrUnreachableError } from '../api/errorMessage'
import ServerUnavailableNotice from '../components/ServerUnavailableNotice'
import { formatNumberIN, formatRupees } from '../utils/localeFormat'

const emptyForm = () => ({
  name: '',
  description: '',
  price: '',
  stockQuantity: '',
  category: '',
  imageUrl: '',
})

export default function AdminProductsPage() {
  const formId = useId()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [loadErrorUnreachable, setLoadErrorUnreachable] = useState(false)
  const [forbidden, setForbidden] = useState(false)

  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  const loadProducts = useCallback(async () => {
    setLoadError('')
    setLoadErrorUnreachable(false)
    setForbidden(false)
    setLoading(true)
    try {
      const data = await fetchAdminProducts()
      setProducts(Array.isArray(data) ? data : [])
    } catch (e) {
      if (e.response?.status === 403) {
        setForbidden(true)
      } else {
        setLoadErrorUnreachable(isNetworkOrUnreachableError(e))
        setLoadError(getErrorMessage(e, 'Could not load products.'))
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  function startEdit(p) {
    setEditingId(p.id)
    setForm({
      name: p.name ?? '',
      description: p.description ?? '',
      price: p.price != null ? String(p.price) : '',
      stockQuantity: p.stockQuantity != null ? String(p.stockQuantity) : '',
      category: p.category ?? '',
      imageUrl: p.imageUrl ?? '',
    })
    setFormError('')
    setFormSuccess('')
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm())
    setFormError('')
    setFormSuccess('')
  }

  function buildPayload() {
    const price = Number(form.price)
    const stockQuantity = Number(form.stockQuantity)
    return {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      stockQuantity,
      category: form.category.trim(),
      imageUrl: form.imageUrl.trim(),
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    const payload = buildPayload()
    if (
      !payload.name ||
      !payload.description ||
      !payload.category ||
      !payload.imageUrl ||
      !Number.isFinite(payload.price) ||
      payload.price < 1 ||
      !Number.isFinite(payload.stockQuantity) ||
      payload.stockQuantity < 1
    ) {
      setFormError(
        'Fill all fields. Price and stock must be at least 1 (same rules as the API).'
      )
      return
    }

    setSaving(true)
    try {
      if (editingId != null) {
        const msg = await updateAdminProduct(editingId, payload)
        setEditingId(null)
        setForm(emptyForm())
        setFormError('')
        setFormSuccess(msg || 'Product updated.')
      } else {
        const msg = await createAdminProduct(payload)
        setFormSuccess(msg || 'Product added.')
        setForm(emptyForm())
        setFormError('')
      }
      await loadProducts()
    } catch (err) {
      setFormError(getErrorMessage(err, 'Request failed.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    const ok = window.confirm('Delete this product? Orders may still reference it.')
    if (!ok) return
    setFormError('')
    setFormSuccess('')
    try {
      const msg = await deleteAdminProduct(id)
      setFormSuccess(msg || 'Product deleted.')
      if (editingId === id) cancelEdit()
      await loadProducts()
    } catch (err) {
      setFormError(getErrorMessage(err, 'Could not delete.'))
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">Admin — products</h1>
        <p className="text-slate-600">Loading…</p>
      </div>
    )
  }

  if (forbidden) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 text-sm">
          <Link to="/" className="font-medium text-emerald-700 hover:text-emerald-800">
            ← Home
          </Link>
          <Link to="/admin/users" className="font-medium text-emerald-700 hover:text-emerald-800">
            Admin users →
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Admin — products</h1>
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Your account does not have admin access (<code className="text-xs">ROLE_ADMIN</code>
          ). This area is only for catalogue managers.
        </p>
        <p className="text-sm text-slate-600">
          You can still browse and order from{' '}
          <Link to="/products" className="font-medium text-emerald-700 hover:text-emerald-800">
            Products
          </Link>
          .
        </p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Admin — products</h1>
        {loadErrorUnreachable ? (
          <ServerUnavailableNotice onRetry={loadProducts} retrying={loading} />
        ) : (
          <div className="space-y-4">
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {loadError}
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
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link to="/products" className="font-medium text-emerald-700 hover:text-emerald-800">
              ← Storefront catalogue
            </Link>
            <Link to="/admin/users" className="font-medium text-emerald-700 hover:text-emerald-800">
              Admin users →
            </Link>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Admin — products</h1>
          <p className="mt-1 text-sm text-slate-600">
            Create, update, and delete catalogue items. Validation matches the backend (e.g. name
            and category: letters, numbers, spaces only).
          </p>
        </div>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {editingId != null ? `Edit product #${editingId}` : 'Add product'}
        </h2>
        <form id={formId} onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
          {formSuccess ? (
            <p
              className="sm:col-span-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
              role="status"
            >
              {formSuccess}
            </p>
          ) : null}
          {formError ? (
            <p className="sm:col-span-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {formError}
            </p>
          ) : null}
          <div className="sm:col-span-2">
            <label htmlFor={`${formId}-name`} className="block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              id={`${formId}-name`}
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="e.g. Basmati rice 5kg"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor={`${formId}-desc`} className="block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              id={`${formId}-desc`}
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor={`${formId}-price`} className="block text-sm font-medium text-slate-700">
              Price (₹)
            </label>
            <input
              id={`${formId}-price`}
              type="number"
              min={1}
              step="0.01"
              required
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor={`${formId}-stock`} className="block text-sm font-medium text-slate-700">
              Stock quantity
            </label>
            <input
              id={`${formId}-stock`}
              type="number"
              min={1}
              step={1}
              required
              value={form.stockQuantity}
              onChange={(e) => setForm((f) => ({ ...f, stockQuantity: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor={`${formId}-cat`} className="block text-sm font-medium text-slate-700">
              Category
            </label>
            <input
              id={`${formId}-cat`}
              required
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="e.g. Groceries"
            />
          </div>
          <div>
            <label htmlFor={`${formId}-img`} className="block text-sm font-medium text-slate-700">
              Image URL
            </label>
            <input
              id={`${formId}-img`}
              type="url"
              required
              value={form.imageUrl}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="https://…"
            />
          </div>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {saving ? 'Saving…' : editingId != null ? 'Save changes' : 'Add product'}
            </button>
            {editingId != null ? (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">All products</h2>
        <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-600">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Reserved</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id} className={editingId === p.id ? 'bg-emerald-50/50' : ''}>
                  <td className="px-4 py-3 font-mono text-slate-800">{p.id}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-slate-900" title={p.name}>
                    {p.name}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{p.category}</td>
                  <td className="px-4 py-3">{formatRupees(p.price)}</td>
                  <td className="px-4 py-3">{formatNumberIN(p.stockQuantity)}</td>
                  <td className="px-4 py-3 text-slate-700">{formatNumberIN(p.reservedQuantity ?? 0)}</td>
                  <td className="space-x-2 whitespace-nowrap px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => startEdit(p)}
                      className="font-medium text-emerald-700 hover:text-emerald-800"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      className="font-medium text-red-700 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No products yet. Add one above.</p>
        ) : null}
      </section>
    </div>
  )
}
