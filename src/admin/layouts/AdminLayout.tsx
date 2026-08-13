import {useCallback, useEffect, useRef, useState} from 'react'
import {Outlet} from 'react-router-dom'
import {AdminHeader} from './AdminHeader'
import {AdminSidebar} from './AdminSidebar'
import {ThemeApplier} from '@/admin/components/ThemeApplier'
import {BreadcrumbProvider} from '@/admin/context/BreadcrumbContext'
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

    // The collapsed icon-rail is desktop-only chrome (the toggle that sets it is
    // md:-only), but the boolean itself has no notion of viewport — so if it's
    // collapsed and the window narrows below md:, the mobile drawer would open
    // at full width with icons but no labels. Force it back open below md:
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
            <div ref={layoutRef} data-surface="admin" data-density="compact"
                 className="bg-admin-bg text-admin-text antialiased min-h-screen">
                <ThemeApplier targetRef={layoutRef}/>
                <AdminHeader
                    onMenuClick={() => setIsSidebarOpen(prev => !prev)}
                    isCollapsed={isSidebarCollapsed}
                />
                <AdminSidebar
                    isOpen={isSidebarOpen}
                    onClose={closeSidebar}
                    isCollapsed={isSidebarCollapsed}
                    onToggleCollapsed={() => setSidebarCollapsed(prev => !prev)}
                    onSetCollapsed={setSidebarCollapsed}
                />
                <div
                    className={cn('pt-16 flex-1 transition-all duration-300', isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64')}>
                    <main className="p-4 md:p-6">
                        <Outlet/>
                    </main>
                </div>
            </div>
        </BreadcrumbProvider>
    )
}
