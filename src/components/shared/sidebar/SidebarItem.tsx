import {NavLink} from 'react-router-dom';
import type {Route} from '@/@types/routes.tsx';
import {SidebarSubMenu} from './SidebarSubMenu';
import {SidebarItemContent} from './SidebarItemContent';
import {cn} from '@/utils/cn.ts';

interface SidebarItemProps {
    route: Route;
    isChild?: boolean;
    isCollapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    onItemClick?: () => void;
}

export function SidebarItem({route, isChild, isCollapsed, setCollapsed, onItemClick}: SidebarItemProps) {

    if (route.subMenu && route.subMenu.length > 0) {
        return <SidebarSubMenu route={route} isCollapsed={isCollapsed} setCollapsed={setCollapsed}
                               onItemClick={onItemClick}/>;
    }

    return (
        <NavLink
            to={route.path}
            end={route.meta.menuMatch === 'exact'}
            title={isCollapsed ? route.meta.label : undefined}
            onClick={onItemClick}
            className={({isActive}) => cn(
                'group flex items-center rounded-md transition-colors duration-200 mb-1 w-full text-sm',
                'px-3 py-2.5',
                isChild && !isCollapsed && 'pl-4 relative z-10',
                isActive
                    ? isChild
                        ? 'border-primary bg-primary-subtle ring-1 ring-primary text-primary font-bold'
                        // ? 'bg-primary-subtle text-primary font-bold'
                        : 'border-primary bg-primary-subtle ring-1 ring-primary text-primary font-bold'
                    // : 'bg-primary-subtle text-primary font-bold'
                    : 'text-admin-text-muted hover:bg-admin-sidebar-hover hover:text-admin-text'
            )}
        >
            <SidebarItemContent label={route.meta.label} icon={route.meta.icon} isCollapsed={isCollapsed}/>
        </NavLink>
    );
}
