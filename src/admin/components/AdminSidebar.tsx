import React from 'react';
import {NavLink} from 'react-router-dom';
import {adminRoutes} from '@/configs/routes/adminRoutes.config.ts';
import Icon from '@/components/shared/Icon';

const AdminSidebar: React.FC = () => {
    return (
        <aside className="w-64 bg-slate-100 border-r border-slate-200 h-screen overflow-y-auto hidden md:block">
            <nav className="p-4 space-y-2">
                {adminRoutes
                    .filter(route => !route.meta?.hideInMenu)
                    .map((route) => (
                        <NavLink
                            key={route.key}
                            to={route.path}
                            end
                            className={({isActive}) =>
                                `flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors gap-4 ${
                                    isActive
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-600 hover:bg-slate-200'
                                }`
                            }
                        >
                            {route.meta?.icon && typeof route.meta.icon === 'string' ? (
                                <Icon className="w-5 h-5" name={route.meta.icon} />
                            ) : (
                                route.meta?.icon
                            )}
                            {route.meta?.label || route.key}
                        </NavLink>
                    ))}
            </nav>
        </aside>
    );
};

export default AdminSidebar;
