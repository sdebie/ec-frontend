import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { adminRoutes } from '@/configs/routes/adminRoutes.config.ts';
import Icon from '@/components/shared/Icon';
import { Route } from '@/@types/routes';

const SidebarItem: React.FC<{ route: Route, isCollapsed: boolean }> = ({ route, isCollapsed }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasSubMenu = route.subMenu && route.subMenu.length > 0;

    const content = (
        <div className={`flex items-center gap-4 w-full ${isCollapsed ? 'justify-center' : ''}`}>
            {route.meta?.icon && typeof route.meta.icon === 'string' ? (
                <Icon className="w-5 h-5 min-w-5" name={route.meta.icon} />
            ) : (
                route.meta?.icon
            )}
            {!isCollapsed && (
                <>
                    <span className="grow text-left whitespace-nowrap overflow-hidden text-ellipsis">
                        {route.meta?.label || route.key}
                    </span>
                    {hasSubMenu && (
                        <Icon
                            name="chevron-down"
                            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                    )}
                </>
            )}
        </div>
    );

    const baseClass = "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors gap-4 w-full h-10";

    if (hasSubMenu) {
        if (isCollapsed) {
            // When collapsed, we can show a tooltip and navigate to the parent path.
            return (
                <NavLink
                    to={route.path}
                    end
                    title={route.meta?.label || route.key}
                    className={({ isActive }) =>
                        `${baseClass} ${
                            isActive
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-600 hover:bg-slate-200 cursor-pointer'
                        }`
                    }
                >
                    {content}
                </NavLink>
            );
        }
        return (
            <div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`${baseClass} text-slate-600 hover:bg-slate-200`}
                >
                    {content}
                </button>
                {isOpen && (
                    <div className="mt-1 ml-4 pl-4 border-l border-slate-200 space-y-1">
                        {route.subMenu?.filter(sub => !sub.meta?.hideInMenu).map((sub) => (
                            <SidebarItem key={sub.key} route={sub} isCollapsed={isCollapsed} />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <NavLink
            to={route.path}
            end
            title={isCollapsed ? (route.meta?.label || route.key) : undefined}
            className={({ isActive }) =>
                `${baseClass} ${
                    isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 hover:bg-slate-200'
                }`
            }
        >
            {content}
        </NavLink>
    );
};

const AdminSidebar: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-slate-100 border-r border-slate-200 h-screen overflow-y-auto hidden md:flex flex-col transition-all duration-300`}>
            <div className={`p-4 flex ${isCollapsed ? 'justify-center' : 'justify-end'} border-b border-slate-200 mb-2`}>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                    title={isCollapsed ? "Expand" : "Collapse"}
                >
                    <Icon name={isCollapsed ? "panel-left-open" : "panel-left-close"} className="w-5 h-5" />
                </button>
            </div>
            <nav className="p-4 space-y-2 flex-1">
                {adminRoutes
                    .filter(route => !route.meta?.hideInMenu)
                    .map((route) => (
                        <SidebarItem key={route.key} route={route} isCollapsed={isCollapsed} />
                    ))}
            </nav>
        </aside>
    );
};

export default AdminSidebar;
