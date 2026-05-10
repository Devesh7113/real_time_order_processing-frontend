import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="space-y-4 text-center">
      <p className="text-6xl font-bold text-slate-300">404</p>
      <h1 className="text-xl font-semibold text-slate-900">Page not found</h1>
      <p className="text-slate-600">
        The path you opened does not match any route in this app.
      </p>
      <Link
        to="/"
        className="inline-block rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        Back to home
      </Link>
    </div>
  )
}
