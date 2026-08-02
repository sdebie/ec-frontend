import type { ReactNode } from 'react'
import { Section } from '@/storefront/sections/shared'

/**
 * Signed in, this page renders inside the account layout, which already provides
 * the page container — only the vertical rhythm is needed here. Signed out it
 * owns the shared page shell (as a div: StorefrontLayout owns the <main>
 * landmark, so a nested one would be invalid).
 */
export function WishlistShell({ isSignedIn, children }: { isSignedIn: boolean; children: ReactNode }) {
  if (isSignedIn) return <div className="space-y-6">{children}</div>
  return (
    <Section as="div" width="wide">
      <div className="space-y-6">{children}</div>
    </Section>
  )
}
