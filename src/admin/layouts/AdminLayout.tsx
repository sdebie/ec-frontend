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
            <div ref={layoutRef} data-surface="admin" data-density="compact"
                 className="bg-admin-bg text-admin-text antialiased min-h-screen">
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
                <div
                    className={cn('pt-15 flex-1 transition-all duration-450', isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64')}>
                    <main className="px-4 pb-4 pt-3 md:px-6 md:pb-6 md:pt-4">
                        <Outlet/>
                    </main>
                </div>
            </div>
        </BreadcrumbProvider>
    )
}
