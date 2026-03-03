import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '@/components/shared/icon/Icon.tsx';

interface AdminHeaderProps {
    onMenuClick?: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick }) => {
    const navigate = useNavigate();
    const [showStaffMenu, setShowStaffMenu] = useState(false);
    const staffMenuRef = useRef<HTMLDivElement>(null);

    // Close the staff menu if a click occurs outside of it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (staffMenuRef.current && !staffMenuRef.current.contains(event.target as Node)) {
                setShowStaffMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        // Basic logout logic, can be expanded
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        setShowStaffMenu(false);
        window.location.href = '/admin/login';
        console.log('User logged out...');
    };

    // This should be replaced with actual authentication status
    const isAuthenticated = true;

    return (
        <header className="w-full bg-slate-800 text-white border-b border-slate-700 relative z-50">
            <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4 md:gap-6">
                    <button
                        className="md:hidden p-2 -ml-2 text-slate-300 hover:text-white"
                        onClick={onMenuClick}
                        aria-label="Toggle menu"
                    >
                        <Icon name="menu" className="w-6 h-6" />
                    </button>
                    <Link to="/admin" className="text-lg font-bold hover:text-blue-400">
                        E-Comm Admin
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded"
                    >
                        View Store
                    </button>

                    {isAuthenticated ? (
                        <div className="relative" ref={staffMenuRef}>
                            <div
                                className="cursor-pointer"
                                title="Staff Profile"
                                onClick={() => setShowStaffMenu(!showStaffMenu)}
                            >
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">
                                    A
                                </div>
                            </div>

                            {showStaffMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Log Out
                                    </button>
                                </div>
                            )}
                        </div>
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