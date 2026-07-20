import { useLocation, Link } from 'react-router-dom'

export function AdminNotFoundPage() {
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div
        className="w-full max-w-md rounded-xl p-8 text-center"
        style={{
          background: 'var(--c-panel)',
          border: '1px solid var(--c-border)',
          boxShadow: 'var(--c-shadow-sm)',
        }}
      >
        <p className="text-5xl font-bold mb-4" style={{ color: 'var(--c-accent)' }}>404</p>
        <h1 className="text-xl font-semibold mb-2" style={{ color: 'var(--c-text)' }}>
          Page not found
        </h1>
        <p className="text-sm mb-1" style={{ color: 'var(--c-text-muted)' }}>
          The admin page at
        </p>
        <code
          className="block text-xs rounded px-2 py-1 mb-6 truncate"
          style={{ background: 'var(--c-bg)', color: 'var(--c-text-muted)', border: '1px solid var(--c-border)' }}
        >
          {pathname}
        </code>
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
          style={{ background: 'var(--c-accent)', color: 'var(--c-accent-text)' }}
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
