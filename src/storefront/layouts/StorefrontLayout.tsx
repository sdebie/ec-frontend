import { Outlet } from 'react-router-dom'
import { AnnouncementBanner } from './AnnouncementBanner'
import { StorefrontFooter } from './StorefrontFooter'
import { StorefrontHeader } from './StorefrontHeader'

export function StorefrontLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-(--sf-background) text-(--sf-text)">
      <AnnouncementBanner />
      <StorefrontHeader />
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <StorefrontFooter />
    </div>
  )
}
