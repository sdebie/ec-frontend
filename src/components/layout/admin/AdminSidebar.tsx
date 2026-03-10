import {useMemo, useState, useEffect} from 'react';
import {adminRoutes} from '@/configs/routes/adminRoutes.config.ts';
import {SidebarSection} from '@/components';
import {SidebarItem} from '@/components';
import {hasRequiredAuthority} from '@/utils/authorizationHelper.ts';
import {cn} from '@/utils/cn.ts';
import {isRouteVisibleInSidebar} from '@/utils/sidebarVisibility.ts';
import type {Route} from '@/@types/routes.tsx';

interface AdminSidebarXProps {
    isOpen?: boolean,
    onClose?: () => void
}

export function AdminSidebar({isOpen, onClose}: AdminSidebarXProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const authorizedRoutes = useMemo(() => {
        return adminRoutes.filter(route =>
            isRouteVisibleInSidebar(route) && hasRequiredAuthority(route.authority)
        );
    }, []);

    const routesBySection = useMemo(() => {
        const grouped: Record<string, Route[]> = {};
        authorizedRoutes.forEach(route => {
            const section = route.meta.section || 'MAIN';
            if (!grouped[section]) {
                grouped[section] = [];
            }
            grouped[section].push(route);
        });
        return grouped;
    }, [authorizedRoutes]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose?.();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Handle clicking a menu item on mobile
    const handleItemClick = () => {
        if (isOpen) {
            onClose?.();
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 h-screen pt-16 transition-transform duration-300 bg-admin-sidebar-bg border-r border-admin-sidebar-border overflow-hidden",
                    // Desktop: always visible, width changes based on collapsed state
                    "md:translate-x-0",
                    isCollapsed ? "md:w-20" : "md:w-64",
                    // Mobile: full width when open, hidden when closed
                    "w-64",
                    isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
            >
                <div className="h-full px-3 py-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    {Object.entries(routesBySection).map(([section, routes]) => (
                        <SidebarSection key={section} title={section} isCollapsed={isCollapsed}>
                            {routes.map(route => (
                                <li key={route.key} className="w-full list-none">
                                    <SidebarItem
                                        route={route}
                                        isCollapsed={isCollapsed}
                                        setCollapsed={setIsCollapsed}
                                        onItemClick={handleItemClick}
                                    />
                                </li>
                            ))}
                        </SidebarSection>
                    ))}
                </div>
            </aside>
        </>
    );
}
