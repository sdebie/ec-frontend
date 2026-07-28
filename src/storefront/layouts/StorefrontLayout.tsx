import { Outlet } from 'react-router-dom'
import { useRestoreCustomerSession } from '@/storefront/customer/auth/hooks/useRestoreCustomerSession'
import { AnnouncementBanner } from './AnnouncementBanner'
import { StorefrontFooter } from './StorefrontFooter'
import { StorefrontHeader } from './StorefrontHeader'

export function StorefrontLayout() {
  const { isRestoring } = useRestoreCustomerSession()

  return (
    <div className="flex min-h-screen flex-col bg-(--sf-background) text-(--sf-text)">
      <AnnouncementBanner />
      <StorefrontHeader />
      {/*
        Page content waits only while a persisted token is being exchanged for
        the customer's tier. An anonymous shopper holds no token, so this is
        never reached for them — but a wholesale customer must not be shown
        retail prices for the frame or two before the tier arrives.
      */}
      <main className="flex flex-1 flex-col">
        {isRestoring ? <div aria-busy="true" aria-label="Loading" /> : <Outlet />}
      </main>
      <StorefrontFooter />
    </div>
  )
}
