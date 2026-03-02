import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { adminRoutes } from '@/configs/routes/adminRoutes.config.ts';
import Icon from '@/components/shared/Icon';
import { Route } from '@/@types/routes';

const SidebarItem: React.FC<{ route: Route }> = ({ route }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasSubMenu = route.subMenu && route.subMenu.length > 0;

    const content = (
        <div className={"flex items-center gap-4 w-full"}>
            {route.meta?.icon && typeof route.meta.icon === 'string' ? (
                <Icon className="w-5 h-5" name={route.meta.icon} />
            ) : (
                route.meta?.icon
            )}
            <span className="flex-grow text-left">{route.meta?.label || route.key}</span>
            {hasSubMenu && (
                <Icon
                    name="chevron-down"
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            )}
        </div>
    );

    const baseClass = "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors gap-4 w-full";

    if (hasSubMenu) {
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
                            <SidebarItem key={sub.key} route={sub} />
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
    return (
        <aside className="w-64 bg-slate-100 border-r border-slate-200 h-screen overflow-y-auto hidden md:block">
            <nav className="p-4 space-y-2">
                {adminRoutes
                    .filter(route => !route.meta?.hideInMenu)
                    .map((route) => (
                        <SidebarItem key={route.key} route={route} />
                    ))}
            </nav>
        </aside>
    );
};

export default AdminSidebar;
