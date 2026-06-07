import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { SITE_NAME } from '../config/site'

function IconSpark(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
      />
    </svg>
  )
}

function IconShield(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    </svg>
  )
}

function IconClock(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

export default function HomePage() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const name = user?.displayName?.trim()
  const greeting = name ? `Welcome back, ${name}` : 'Welcome back'

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 px-6 py-10 shadow-lg sm:px-10 sm:py-12">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 left-1/4 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl"
          aria-hidden
        />
        <div className="relative max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/90">{SITE_NAME}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">{greeting}</h1>
          <p className="mt-4 text-base leading-relaxed text-emerald-50/95 sm:text-lg">
            Thanks for shopping with us. Use the menu to explore products, place an order, review your
            history, or chat with support.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-emerald-800 shadow-md transition hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-700"
            >
              Browse products
            </Link>
            <Link
              to="/support"
              className="inline-flex items-center justify-center rounded-lg border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-700"
            >
              Get support
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <IconSpark className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-semibold text-slate-900">Thoughtful selection</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Find what you need with clear photos, descriptions, and categories.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <IconShield className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-semibold text-slate-900">Your account, protected</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Your cart and orders stay linked to your sign-in for a smooth experience every time.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <IconClock className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-semibold text-slate-900">Orders at a glance</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Follow status updates and timelines so you always know what happens next.
          </p>
        </div>
      </section>

      <aside className="rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-5 py-4 text-center sm:text-left">
        <p className="text-sm font-semibold text-emerald-950">We&apos;re glad you&apos;re here</p>
        <p className="mt-1 text-sm text-emerald-900/85">
          New items arrive often — check back to see what&apos;s new.
        </p>
      </aside>
    </div>
  )
}
