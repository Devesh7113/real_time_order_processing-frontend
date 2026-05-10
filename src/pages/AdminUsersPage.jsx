import { useCallback, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { grantAdminByEmail, searchAdminUsers } from '../api/adminUsersApi'
import { getErrorMessage, isNetworkOrUnreachableError } from '../api/errorMessage'
import ServerUnavailableNotice from '../components/ServerUnavailableNotice'
import { useAuth } from '../hooks/useAuth'

function rolesIncludeAdmin(roles) {
  const r = String(roles ?? '')
  return r.includes('ROLE_ADMIN')
}

export default function AdminUsersPage() {
  const formId = useId()
  const { user } = useAuth()
  const sessionEmail = user?.email?.trim().toLowerCase() ?? ''

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searchError, setSearchError] = useState('')
  const [searching, setSearching] = useState(false)
  const [networkUnreachable, setNetworkUnreachable] = useState(false)
  const [forbidden, setForbidden] = useState(false)

  const [grantErrors, setGrantErrors] = useState(() => ({}))
  const [grantBusyEmail, setGrantBusyEmail] = useState(null)
  const [grantSuccess, setGrantSuccess] = useState('')
  /** Last query string we successfully received an API response for (empty list allowed). */
  const [lastFetchedQuery, setLastFetchedQuery] = useState(null)

  const runSearch = useCallback(async () => {
    setSearchError('')
    setGrantSuccess('')
    setForbidden(false)
    const q = query.trim()
    if (q.length < 2) {
      setSearchError('Enter at least 2 characters to search.')
      setResults([])
      setLastFetchedQuery(null)
      return
    }
    setSearching(true)
    setNetworkUnreachable(false)
    try {
      const list = await searchAdminUsers(q)
      setResults(list)
      setGrantErrors({})
      setLastFetchedQuery(q)
    } catch (err) {
      setLastFetchedQuery(null)
      if (err.response?.status === 403) {
        setForbidden(true)
        setResults([])
      } else {
        setNetworkUnreachable(isNetworkOrUnreachableError(err))
        setSearchError(getErrorMessage(err, 'Search failed.'))
        setResults([])
      }
    } finally {
      setSearching(false)
    }
  }, [query])

  function handleSearch(e) {
    e.preventDefault()
    runSearch()
  }

  async function handleGrant(email) {
    setGrantSuccess('')
    setGrantErrors((prev) => ({ ...prev, [email]: '' }))
    setGrantBusyEmail(email)
    try {
      const msg = await grantAdminByEmail(email)
      setGrantSuccess(msg || 'Done.')
      const q = query.trim()
      if (q.length >= 2) {
        const list = await searchAdminUsers(q)
        setResults(list)
        setLastFetchedQuery(q)
      }
    } catch (err) {
      setGrantErrors((prev) => ({
        ...prev,
        [email]: getErrorMessage(err, 'Could not grant admin.'),
      }))
    } finally {
      setGrantBusyEmail(null)
    }
  }

  if (forbidden) {
    return (
      <div className="space-y-4">
        <Link to="/" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
          ← Home
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Admin — users</h1>
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Your account does not have admin access (<code className="text-xs">ROLE_ADMIN</code>). Ask another admin to grant access,
          then sign out and sign in again.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/admin/products" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
            ← Admin products
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Admin — users</h1>
          <p className="mt-1 text-sm text-slate-600">
            Search matches any registered email containing your text (including <strong>your own</strong> account). Grant{' '}
            <code className="text-xs">ROLE_ADMIN</code> — that user must log in again for a new JWT.
          </p>
        </div>
      </div>

      <form id={formId} onSubmit={handleSearch} className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="min-w-[14rem] flex-1">
          <label htmlFor={`${formId}-q`} className="block text-sm font-medium text-slate-700">
            Email contains
          </label>
          <input
            id={`${formId}-q`}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. @gmail.com or john"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
            autoComplete="off"
          />
        </div>
        <button
          type="submit"
          disabled={searching}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {searching ? 'Searching…' : 'Search'}
        </button>
      </form>

      {networkUnreachable ? (
        <ServerUnavailableNotice onRetry={() => runSearch()} retrying={searching} />
      ) : searchError ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {searchError}
        </p>
      ) : null}

      {grantSuccess ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
          {grantSuccess}
        </p>
      ) : null}

      {results.length === 0 &&
      !searching &&
      lastFetchedQuery != null &&
      lastFetchedQuery === query.trim() &&
      !searchError &&
      !networkUnreachable ? (
        <p className="text-sm text-slate-600">No users matched.</p>
      ) : null}

      {results.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-600">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Roles</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((row) => {
                const isSelf =
                  sessionEmail.length > 0 &&
                  String(row.email ?? '')
                    .trim()
                    .toLowerCase() === sessionEmail
                return (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-mono text-slate-800">
                    <span>{row.email}</span>
                    {isSelf ? (
                      <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                        Your account
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{row.username?.trim() || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">
                    <code className="text-xs">{row.roles || '—'}</code>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {rolesIncludeAdmin(row.roles) ? (
                      <span className="text-xs text-slate-500">Already admin</span>
                    ) : (
                      <button
                        type="button"
                        disabled={grantBusyEmail === row.email}
                        onClick={() => handleGrant(row.email)}
                        className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {grantBusyEmail === row.email ? 'Saving…' : 'Make admin'}
                      </button>
                    )}
                    {grantErrors[row.email] ? (
                      <p className="mt-1 text-xs text-red-700">{grantErrors[row.email]}</p>
                    ) : null}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
