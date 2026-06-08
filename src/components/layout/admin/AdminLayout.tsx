import React, {useState} from 'react';
import {AdminSidebar} from "@/components/layout/admin/AdminSidebar.tsx";
import {AppShell} from '@/primitives/app-shell';
import {SurfaceProvider} from '@/primitives/surface';
import {cn} from "@/utils/cn.ts";
import AdminHeader from './AdminHeader.tsx';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <SurfaceProvider surface="admin" density="compact">
            <AppShell className="bg-admin-bg text-admin-text antialiased transition-colors duration-200">
                <AdminHeader
                    onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
                />

                <AdminSidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

                {/* Offset for fixed header (pt-15) and fixed sidebar (md:ml-64) */}
                <div className={cn("pt-15 flex-1 transition-all duration-300", "md:ml-64")}>
                    <main className="p-4 md:p-6">
                        {children}
                    </main>
                </div>
            </AppShell>
        </SurfaceProvider>
    );
};

export default AdminLayout;
