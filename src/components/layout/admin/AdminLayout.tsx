import React, {useState} from 'react';


import {AdminSidebar} from "@/components/layout/admin/AdminSidebar.tsx";
import {SurfaceProvider} from '@/primitives/surface';
import {cn} from "@/utils/cn.ts";

import AdminHeader from './AdminHeader.tsx';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({children}) => {

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <SurfaceProvider surface="admin" density="compact">
            <div className="min-h-screen bg-admin-bg text-admin-text antialiased transition-colors duration-200">
                <AdminHeader
                    onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
                />

                <AdminSidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

                <div className={cn("pt-15 min-h-screen transition-all duration-300", "md:ml-64")}>
                    <main className="p-4 md:p-6">
                        {children}
                    </main>
                </div>
            </div>
        </SurfaceProvider>
    );
};

export default AdminLayout;
