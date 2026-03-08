import {useMemo, useState} from 'react';
import {matchPath, useLocation} from 'react-router-dom';
import type {Route} from '@/@types/routes.tsx';
import {SidebarItem} from '@/components';
import {SidebarItemContent} from './SidebarItemContent';
import {cn} from '@/utils/cn.ts';
import {hasRequiredAuthority} from '@/utils/authorizationHelper.ts';

interface SidebarSubMenuProps {
    route: Route;
    isCollapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    onItemClick?: () => void;
}

export function SidebarSubMenu({route, isCollapsed, setCollapsed, onItemClick}: SidebarSubMenuProps) {
    const location = useLocation();

    const authorizedChildren = useMemo(
        () => route.subMenu?.filter(child => hasRequiredAuthority(child.authority)) ?? [],
        [route.subMenu]
    );

    const matchesRoute = (targetRoute: Route) => {
        const end = targetRoute.meta.menuMatch === 'exact';
        return Boolean(matchPath({path: targetRoute.path, end}, location.pathname));
    };

    const hasActiveChild = authorizedChildren.some(child => matchesRoute(child));
    const isParentActive = matchesRoute(route) || hasActiveChild;
    const [isExpanded, setIsExpanded] = useState(() => hasActiveChild);

    const toggleExpand = () => {
        if (isCollapsed) {
            setCollapsed(false);
            setIsExpanded(true);
            return;
        }

        setIsExpanded(prev => !prev);
    };

    return (
        <div className="flex flex-col mb-1 w-full">
            <button
                onClick={toggleExpand}
                type="button"
                className={cn(
                    'w-full flex items-center rounded-md transition-colors duration-200 group text-left cursor-pointer text-sm',
                    'px-3 py-2.5',
                    isParentActive
                        ? 'bg-admin-sidebar-active text-primary'
                        : 'text-admin-text-muted hover:bg-admin-sidebar-hover hover:text-admin-text'
                )}
                title={isCollapsed ? route.meta.label : undefined}
            >
                <SidebarItemContent
                    label={route.meta.label}
                    icon={route.meta.icon}
                    hasSubMenu={true}
                    isExpanded={isExpanded}
                    isCollapsed={isCollapsed}
                />
            </button>

            {!isCollapsed && isExpanded && authorizedChildren.length > 0 && (
                <ul className="pl-6 mt-1 py-1 space-y-1 relative rounded-md">
                    <div
                        className={cn(
                            'absolute left-4.5 top-0 bottom-0 w-px',
                            hasActiveChild ? 'bg-primary/40' : 'bg-admin-sidebar-border'
                        )}
                    />
                    {authorizedChildren.map(child => (
                        <li key={child.key} className="relative z-10 w-full mb-1 last:mb-0">
                            <SidebarItem
                                route={child}
                                isChild={true}
                                isCollapsed={isCollapsed}
                                setCollapsed={setCollapsed}
                                onItemClick={onItemClick}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
