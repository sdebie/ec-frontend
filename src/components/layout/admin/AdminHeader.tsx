import {Menu as MenuIcon} from "lucide-react";
import React from "react";
import {Link, useNavigate} from 'react-router-dom';

import {Menu, MenuItem, MenuLabel, MenuList, MenuSection, MenuSeparator, MenuTrigger} from "@/components";
import AdminThemeToggle from "@/components/layout/admin/AdminThemeToggle.tsx";

interface AdminHeaderProps {
    onMenuClick?: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({onMenuClick}) => {

    const navigate = useNavigate();

    const handleLogout = () => {
        // Basic logout logic, can be expanded
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/admin/login';
        console.log('User logged out...');
    };

    // This should be replaced with actual authentication status
    const isAuthenticated = true;

    return (
        <header
            className="fixed top-0 z-60 w-full bg-admin-header-bg border-b border-admin-border backdrop-blur-sm bg-opacity-90">
            <div className="flex px-4 py-3 justify-between items-center w-full">
                <div className="flex items-center justify-start gap-4">
                    <button
                        type="button"
                        onClick={onMenuClick}
                        className="md:hidden p-2 text-admin-text-muted hover:text-admin-text hover:bg-admin-sidebar-hover rounded-lg transition-colors"
                    >
                        <span className="sr-only">Open sidebar</span>
                        <MenuIcon className="w-6 h-6"/>
                    </button>

                    <Link to="/admin" className="flex items-center ms-2 md:me-24 gap-2 text-primary group">
                        <span
                            className="self-center text-xl font-bold sm:text-2xl whitespace-nowrap text-admin-text tracking-tight">
                            E-Comm Admin
                        </span>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <AdminThemeToggle/>
                    <div className="h-8 w-px bg-admin-border hidden md:block"></div>
                    <a href='/ec-frontend/public'
                       className="hidden md:flex items-center gap-2 text-sm font-medium text-admin-text hover:text-primary transition-colors"
                    >
                        <span
                            className="bg-admin-sidebar-hover text-admin-text-muted px-2.5 py-1.5 rounded-md border border-admin-border hover:border-primary/30 transition-colors"
                        >
                            View Store
                        </span>
                    </a>

                    {isAuthenticated ? (
                        <Menu>
                            <MenuTrigger asChild>
                                <button
                                    type="button"
                                    className="cursor-pointer"
                                    title="Staff Profile"
                                >
                                    <div
                                        className="flex items-center justify-center w-9 h-9 rounded-full bg-linear-to-tr from-primary to-primary-subtle text-white font-bold text-sm shadow-md ring-2 ring-admin-panel cursor-pointer">
                                        A
                                    </div>
                                </button>
                            </MenuTrigger>
                            <MenuList position="bottom-right">
                                <MenuSection>
                                    <MenuLabel>Account</MenuLabel>
                                    <MenuItem onClick={() => navigate('/admin/profile')}>
                                        View Profile
                                    </MenuItem>
                                </MenuSection>
                                <MenuSeparator/>
                                <MenuItem onClick={handleLogout}>
                                    Log Out
                                </MenuItem>
                            </MenuList>
                        </Menu>
                    ) : (
                        <Link to="/admin/login" className="text-sm hover:text-blue-400">
                            Log In
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;