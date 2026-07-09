import type { ErrorInfo, PropsWithChildren, ReactNode } from 'react'
import { Component } from 'react'

type State = { error: Error | null }

export type RouteErrorBoundaryProps = PropsWithChildren<{
  /**
   * URL for the "Go home" escape link.
   * Use '/' for storefront routes, '/admin' for admin routes.
   * @default '/'
   */
  homeUrl?: string
}>

/**
 * Class-based error boundary for route-level renders.
 *
 * Catches React Router errors and runtime render errors inside page components.
 * Renders a user-readable error message with a link to navigate home.
 *
 * React Router re-mounts children on navigation, so navigating away from a
 * crashed route and back will naturally reset the boundary. For same-route
 * recovery use the "Try again" button which calls setState({ error: null }).
 */
export class RouteErrorBoundary extends Component<RouteErrorBoundaryProps, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[RouteErrorBoundary]', error.message, info.componentStack)
  }

  reset = () => this.setState({ error: null })

  render(): ReactNode {
    const { error } = this.state
    if (error) {
      return (
        <RouteErrorFallback
          error={error}
          onReset={this.reset}
          homeUrl={this.props.homeUrl ?? '/'}
        />
      )
    }
    return this.props.children
  }
}

// ─────────────────────────────────────────────────────────────────────────────

function RouteErrorFallback({
  error,
  onReset,
  homeUrl,
}: {
  error: Error
  onReset: () => void
  homeUrl: string
}) {
  const isDev = import.meta.env.DEV

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div
        className="w-full max-w-md rounded-xl p-8 text-center"
        style={{
          background: 'var(--c-panel, #ffffff)',
          border: '1px solid var(--c-border, #e5e7eb)',
          boxShadow: 'var(--c-shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
        }}
      >
        {/* Warning icon */}
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full"
          style={{
            background: 'color-mix(in srgb, var(--c-accent, #ef4444) 12%, transparent)',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-7 w-7"
            style={{ color: 'var(--c-accent, #ef4444)' }}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>

        <h2
          className="mb-2 text-xl font-semibold"
          style={{ color: 'var(--c-text, #111827)' }}
        >
          Something went wrong
        </h2>
        <p
          className="mb-6 text-sm leading-relaxed"
          style={{ color: 'var(--c-text-muted, #6b7280)' }}
        >
          This page hit an unexpected error. You can try again or go back to the home page.
        </p>

        {/* Dev-only: error message */}
        {isDev && (
          <pre
            className="mb-6 overflow-auto rounded-lg p-3 text-left text-xs"
            style={{
              background: 'var(--c-bg, #f9fafb)',
              color: 'var(--c-text-muted, #6b7280)',
              border: '1px solid var(--c-border, #e5e7eb)',
            }}
          >
            {error.message}
          </pre>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
            style={{
              background: 'var(--c-accent, #2563eb)',
              color: 'var(--c-accent-text, #ffffff)',
            }}
          >
            Try again
          </button>
          <a
            href={homeUrl}
            className="rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-70"
            style={{
              background: 'var(--c-bg, #f3f4f6)',
              color: 'var(--c-text, #111827)',
              border: '1px solid var(--c-border, #e5e7eb)',
            }}
          >
            Go to home page
          </a>
        </div>
      </div>
    </div>
  )
}
