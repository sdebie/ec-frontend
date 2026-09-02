import {useCallback, useEffect, useRef, useState} from 'react'
import {Outlet} from 'react-router-dom'
import {AdminHeader} from './AdminHeader'
import {AdminSidebar} from './AdminSidebar'
import {ThemeApplier} from '@/admin/components/ThemeApplier'
import {BreadcrumbProvider} from '@/admin/context/BreadcrumbContext'
import {PageBackActionProvider} from '@/admin/context/PageBackActionContext'
import {cn} from '@/shared/utils/cn'

export function AdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false)
    const closingRef = useRef(false)
    const layoutRef = useRef<HTMLDivElement>(null)

    const closeSidebar = useCallback(() => {
        if (closingRef.current) return
        closingRef.current = true
        setIsSidebarOpen(false)
        setTimeout(() => {
            closingRef.current = false
        }, 50)
    }, [])

    // The collapsed rail is desktop-only chrome, but the boolean has no notion of viewport — force it back open below md: so a narrowed window doesn't open the mobile drawer icon-only.
    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return

        const mq = window.matchMedia('(min-width: 768px)')
        const syncToViewport = () => {
            if (!mq.matches) setSidebarCollapsed(false)
        }

        syncToViewport()
        mq.addEventListener('change', syncToViewport)
        return () => mq.removeEventListener('change', syncToViewport)
    }, [])

    return (
        <BreadcrumbProvider>
            <PageBackActionProvider>
                <div ref={layoutRef} data-surface="admin" data-density="compact"
                     className="bg-admin-bg text-admin-text antialiased h-screen overflow-hidden">
                    <ThemeApplier targetRef={layoutRef}/>
                    <AdminHeader
                        onMenuClick={() => setIsSidebarOpen(prev => !prev)}
                        isCollapsed={isSidebarCollapsed}
                        onToggleCollapsed={() => setSidebarCollapsed(prev => !prev)}
                    />
                    <AdminSidebar
                        isOpen={isSidebarOpen}
                        onClose={closeSidebar}
                        isCollapsed={isSidebarCollapsed}
                        onSetCollapsed={setSidebarCollapsed}
                    />
                    {/* h-full + flex-col so `main` can be the sole flex-1/min-h-0 scroll region — the header/sidebar are fixed and take no flex space of their own. */}
                    <div
                        className={cn('pt-(--c-header-h) flex h-full flex-col transition-all duration-450', isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64')}>
                        {/* No bottom padding here — position:sticky insets its `bottom:0` by the SCROLLING ANCESTOR's own padding, so a pb-* on main would push any stickyFooter above the true bottom edge. Bottom spacing is each consumer's own concern: PageLayout owns it (conditionally, see PageLayout.tsx), and the few pages that bypass PageLayout own it directly. */}
                        <main className="flex-1 min-h-0 overflow-y-auto px-4 pt-3 md:px-6 md:pt-4">
                            <Outlet/>
                        </main>
                    </div>
                </div>
            </PageBackActionProvider>
        </BreadcrumbProvider>
    )
}
