import { Outlet } from 'react-router-dom'
import { useRestoreCustomerSession } from '@/storefront/customer/auth/hooks/useRestoreCustomerSession'
import { useExpireStaleCheckoutSession } from '@/storefront/checkout/hooks/useExpireStaleCheckoutSession'
import { AnnouncementBanner } from './AnnouncementBanner'
import { StorefrontFooter } from './StorefrontFooter'
import { StorefrontHeader } from './StorefrontHeader'
import { ScrollToTop } from './ScrollToTop'
import { useChromeHeight } from './useChromeHeight'

export function StorefrontLayout() {
  const { isRestoring } = useRestoreCustomerSession()

  // Publishes --sf-chrome-h so a `height: 'full'` hero can fill exactly the
  // space below the bar + header (HeroSection HEIGHT_CLASS).
  const { rootRef, mainRef } = useChromeHeight()

  // Mounted here, not on the checkout page: the cart is written from the
  // catalogue, the product page and the wishlist too, and a session that no
  // longer matches the cart must expire wherever it was invalidated.
  useExpireStaleCheckoutSession()

  return (
    /*
      data-surface/data-density are what bind the shared `--c-*` component
      vocabulary to this client's `--sf-*` branding (tokens.css). Without them
      the [data-surface='storefront'] block never matches, `--c-*` falls through
      :root to the ADMIN palette, and `--c-control-h-*` — which exists only under
      [data-density] — is undefined entirely. Any shared/ui component rendered on
      the storefront depends on these two attributes being here.
    */
    <div
      ref={rootRef}
      data-surface="storefront"
      data-density="comfortable"
      className="flex min-h-screen flex-col bg-(--sf-background) text-(--sf-text)"
    >
      <ScrollToTop />
      <AnnouncementBanner />
      <StorefrontHeader />
      {/*
        Page content waits only while a persisted token is being exchanged for
        the customer's tier. An anonymous shopper holds no token, so this is
        never reached for them — but a wholesale customer must not be shown
        retail prices for the frame or two before the tier arrives.
      */}
      <main ref={mainRef} className="flex flex-1 flex-col">
        {isRestoring ? <div aria-busy="true" aria-label="Loading" /> : <Outlet />}
      </main>
      <StorefrontFooter />
    </div>
  )
}
