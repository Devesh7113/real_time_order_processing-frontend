/**
 * Shown when the API is unreachable (server stopped, network issue, etc.).
 */
export default function ServerUnavailableNotice({ onRetry, retrying = false }) {
  return (
    <div
      className="rounded-xl border border-amber-200/90 bg-gradient-to-b from-amber-50 to-orange-50/80 px-6 py-10 text-center shadow-sm"
      role="alert"
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-800">
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>
      <h2 className="mt-4 text-lg font-semibold text-amber-950">Can&apos;t reach the store</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-amber-900/90">
        The service isn&apos;t responding right now. Check your internet connection, wait a moment,
        then try again.
      </p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          className="mt-6 rounded-lg bg-amber-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {retrying ? 'Trying again…' : 'Try again'}
        </button>
      ) : null}
    </div>
  )
}
