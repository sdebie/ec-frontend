import type { ReactNode } from 'react'
import { ACCENT_LINK_HOVER, Section } from '@/storefront/sections/shared'

/**
 * The frame every customer auth page renders into — sign in, register, and
 * password reset.
 *
 * These three pages are one flow and a shopper moves between them by following
 * a link, so any drift in card width, gutter or heading treatment reads as the
 * page jumping. Sharing the frame is what stops that, and it is why the pieces
 * live together in one module rather than being pasted into each page.
 *
 * The page rides `Section`'s standard rhythm rather than centring itself in a
 * `min-h-screen` box: these pages render inside StorefrontLayout, so a
 * viewport-height box below the chrome pushes the card down by the height of
 * the header it is already sitting under.
 *
 * `max-w-md` at this padding keeps the card's content box at or under the 400px
 * Google Identity Services caps its button at, which is what lets
 * GoogleAuthButton fill the column edge to edge. Widen either one and the
 * Google button stops matching the submit button above it.
 */
export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <Section as="div">
      <div className="mx-auto w-full max-w-md rounded-lg border border-(--sf-border) bg-(--sf-panel) p-6 shadow-(--sf-shadow-sm) sm:p-8">
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
