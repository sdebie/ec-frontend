import React from 'react';
import {Link, useNavigate} from 'react-router-dom';

const AdminHeader: React.FC = () => {
    const navigate = useNavigate();

    return (
        <header className="w-full bg-slate-800 text-white border-b border-slate-700 relative z-50">
            <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-6">
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
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">
                        A
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
