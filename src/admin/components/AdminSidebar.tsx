import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { adminRoutes } from '@/configs/routes/adminRoutes.config.ts';
import Icon from '@/components/shared/Icon';
import { Route } from '@/@types/routes';
import { getUserAuthority, userHasAuthority } from '@/utils/authorizationHelper.ts';

const SidebarItem: React.FC<{ route: Route; userAuthority: string[]; onItemClick?: () => void }> = ({ route, userAuthority, onItemClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasSubMenu = route.subMenu && route.subMenu.length > 0;
    const hasAccess = userHasAuthority({ authority: userAuthority }, route.authority);

    // Don't render items user doesn't have access to
    if (!hasAccess) {
        return null;
    }

    const content = (
        <div className="flex items-center gap-4 w-full">
            {route.meta?.icon && typeof route.meta.icon === 'string' ? (
                <Icon className="w-5 h-5 min-w-5" name={route.meta.icon} />
            ) : (
                route.meta?.icon
            )}
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
        </div>
    );

    const baseClass = "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors gap-4 w-full h-10";

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
                            <SidebarItem key={sub.key} route={sub} userAuthority={userAuthority} onItemClick={onItemClick} />
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
            onClick={onItemClick}
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

const AdminSidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({ isOpen, onClose }) => {
    const userAuthority = getUserAuthority();

    return (
        <>
            {/* ...existing code... */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}
            
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-slate-100 border-r border-slate-200 h-screen overflow-y-auto 
                transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex flex-col
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-4 flex justify-between border-b border-slate-200 md:hidden h-16 items-center">
                    <span className="font-bold text-slate-800">Menu</span>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800">
                        <Icon name="x" className="w-5 h-5" />
                    </button>
                </div>
                <nav className="p-4 space-y-2 flex-1">
                    {adminRoutes
                        .filter(route => !route.meta?.hideInMenu)
                        .map((route) => (
                            <SidebarItem key={route.key} route={route} userAuthority={userAuthority} onItemClick={onClose} />
                        ))}
                </nav>
            </aside>
        </>
    );
};

export default AdminSidebar;
