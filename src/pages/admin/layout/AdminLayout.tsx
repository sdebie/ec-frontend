import React, {useState} from 'react';
import AdminHeader from './AdminHeader.tsx';
import {cn} from "@/utils/cn.ts";

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({children}) => {

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-admin-bg text-admin-text antialiased transition-colors duration-200">
            <AdminHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}/>
            <div className={cn(
                "p-4 pt-20 h-full min-h-screen transition-all duration-300",
                isSidebarOpen ? "md:ml-20" : "md:ml-64"
            )}>
                <main className={"flex-1 overflow-y-auto p-4 md:p-6"}>
                    {children}
                </main>
            </div>
        </div>
        // <div className="admin-theme flex flex-col h-screen overflow-hidden">
        //     <AdminHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}/>
        //     <div className="flex flex-1 overflow-hidden relative">
        //         {/*<AdminSidebar*/}
        //         {/*    isOpen={isSidebarOpen}*/}
        //         {/*    onClose={() => setIsSidebarOpen(false)}*/}
        //         {/*/>*/}
        //         {/*<main className={cn(*/}
        //         {/*    "p-4 pt-20 h-full min-h-screen transition-all duration-300",*/}
        //         {/*    isSidebarOpen ? "md:ml-20" : "md:ml-64"*/}
        //         {/*)}>*/}
        //         <main className="flex-1 overflow-y-auto p-4 md:p-6">
        //             {children}
        //         </main>
        //     </div>
        // </div>
    );
};

export default AdminLayout;
