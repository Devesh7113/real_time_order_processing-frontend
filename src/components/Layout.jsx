import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { SITE_NAME, siteBrandParts } from '../config/site'

const navClass = ({ isActive }) =>
  [
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-emerald-600 text-white'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  ].join(' ')

const btnNeutral =
  'rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900'

export default function Layout() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const { badge, rest } = siteBrandParts()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const navUserLabel = user?.displayName?.trim() || user?.email || ''

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <NavLink
            to={isAuthenticated ? '/' : '/login'}
            className="group flex items-center gap-2.5 rounded-lg outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label={SITE_NAME}
          >
            {rest ? (
              <>
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-base font-black text-white shadow-md ring-1 ring-emerald-700/30 transition group-hover:shadow-lg group-hover:ring-emerald-600/40"
                  aria-hidden
                >
                  {badge}
                </span>
                <span className="text-xl font-bold tracking-tight text-slate-900">{rest}</span>
              </>
            ) : (
              <span className="bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-xl font-bold tracking-tight text-transparent">
                {SITE_NAME}
              </span>
            )}
          </NavLink>
          <div className="flex flex-wrap items-center gap-2">
            {isAuthenticated && navUserLabel ? (
              <span
                className="hidden max-w-[14rem] truncate text-sm text-slate-600 sm:inline"
                title={user?.email ?? undefined}
              >
                {navUserLabel}
              </span>
            ) : null}
            {isAuthenticated ? (
              <nav className="flex flex-wrap items-center gap-1">
                <NavLink to="/" end className={navClass}>
                  Home
                </NavLink>
                <NavLink to="/products" className={navClass}>
                  Products
                </NavLink>
                <NavLink to="/cart" className={navClass}>
                  <span className="inline-flex items-center gap-1.5">
                    Cart
                    {itemCount > 0 ? (
                      <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                        {itemCount > 99 ? '99+' : itemCount}
                      </span>
                    ) : null}
                  </span>
                </NavLink>
                <NavLink to="/orders" className={navClass}>
                  Orders
                </NavLink>
                <NavLink to="/support" className={navClass}>
                  Support
                </NavLink>
                {isAdmin ? (
                  <>
                    <NavLink to="/admin/products" className={navClass}>
                      Admin products
                    </NavLink>
                    <NavLink to="/admin/users" className={navClass}>
                      Admin users
                    </NavLink>
                  </>
                ) : null}
                <button type="button" onClick={handleLogout} className={btnNeutral}>
                  Log out
                </button>
              </nav>
            ) : null}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
