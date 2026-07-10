import { Outlet } from 'react-router-dom'
import { AnnouncementBanner } from './AnnouncementBanner'
import { StorefrontFooter } from './StorefrontFooter'
import { StorefrontHeader } from './StorefrontHeader'

export function StorefrontLayout() {
  return (
    <>
      <AnnouncementBanner />
      <StorefrontHeader />
      <main>
        <Outlet />
      </main>
      <StorefrontFooter />
    </>
  )
}
