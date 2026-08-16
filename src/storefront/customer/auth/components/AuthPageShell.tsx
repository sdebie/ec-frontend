import type { ReactNode } from 'react'
import { ACCENT_LINK_HOVER, Section } from '@/storefront/sections/shared'

/**
 * Width of the card, as a complete literal class per branch — an interpolated
 * `max-w-${…}` never reaches Tailwind's scanner and emits no CSS.
 *
 * `default` keeps the card's content box at or under the 400px Google Identity
 * Services caps its button at, so GoogleAuthButton fills the column edge to
 * edge. Past that ceiling GSI centres its button instead, which is why `wide`
 * is for forms that earn the room — a two-column field grid — rather than a
 * general-purpose knob.
 */
const SHELL_WIDTH_CLASS = {
  default: 'max-w-md',
  wide: 'max-w-2xl',
} as const

export interface AuthPageShellProps {
  children: ReactNode
  /** `wide` for a form whose fields sit in two columns. */
  width?: keyof typeof SHELL_WIDTH_CLASS
}

/**
 * The frame every customer auth page renders into — sign in, register, and
 * password reset.
 *
 * These three pages are one flow and a shopper moves between them by following
 * a link, so any drift in gutter or heading treatment reads as the page
 * jumping. Sharing the frame is what stops that, and it is why the pieces live
 * together in one module rather than being pasted into each page.
 *
 * The card is centred in `Section`'s content column rather than pinned to its
 * left gutter: a narrow card against a wide empty right-hand side reads as
 * content that failed to load, and centring keeps the form the focus of a page
 * that has nothing else on it.
 *
 * The page rides `Section`'s standard rhythm rather than centring itself in a
 * `min-h-screen` box: these pages render inside StorefrontLayout, so a
 * viewport-height box below the chrome pushes the card down by the height of
 * the header it is already sitting under.
 */
export function AuthPageShell({ children, width = 'default' }: AuthPageShellProps) {
  return (
    <Section as="div">
      <div
        className={`mx-auto w-full ${SHELL_WIDTH_CLASS[width]} rounded-lg border border-(--sf-border) bg-(--sf-panel) p-6 shadow-(--sf-shadow-sm) sm:p-8`}
      >
        {children}
      </div>
    </Section>
  )
}

export interface AuthHeadingProps {
  title: string
  /**
   * Supporting copy under the title. Takes nodes, not a string, because the
   * sign-in and register pages put a link here and the reset steps put a
   * sentence.
   */
  children?: ReactNode
}

/**
 * The page title inside an `AuthPageShell`.
 *
 * Always an `h1` — each of these renders as a page, so the document gets
 * exactly one. Deliberately NOT the storefront's `SectionHeading`: that is
 * left-aligned with an accent rule, and these pages centre a single narrow
 * column where a left-aligned rule under a centred title reads as a mistake.
 */
export function AuthHeading({ title, children }: AuthHeadingProps) {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-2xl font-bold tracking-tight text-(--sf-text)">{title}</h1>
      {children && <div className="mt-2 text-sm text-(--sf-muted-text)">{children}</div>}
    </div>
  )
}

/**
 * The accent text link used across the auth flow — "Create one", "Sign in",
 * "Back to login", "Forgot password?", "Resend code".
 *
 * A shared recipe rather than a shared component because the consumers need
 * different ELEMENTS: the page-switch links are `Link`s, while back-to-login
 * and resend-code are `button`s that call a handler.
 *
 * `ACCENT_LINK_HOVER` steps to `--sf-accent-hover`, the same step the primary
 * button's fill takes, so every accent-coloured thing on the card darkens
 * together — not `hover:opacity-80`, which fades the link toward the card
 * behind it instead of shifting the accent.
 */
export const AUTH_LINK_CLASS = `text-sm font-medium text-(--sf-accent) ${ACCENT_LINK_HOVER}`
