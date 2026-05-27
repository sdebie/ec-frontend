import {Monitor, Moon, Sun} from 'lucide-react';

import {useAdminTheme} from "@/hooks/useAdminTheme.ts";
import {cn} from "@/utils/cn.ts";

export default function AdminThemeToggle() {

    const {mode, setMode} = useAdminTheme();

    return (
        <>
            <div className="flex items-center gap-3">
                <div className="hidden md:flex bg-admin-sidebar-hover rounded-full p-1 border border-admin-border">
                    <button
                        onClick={() => setMode('light')}
                        className={cn(
                            "p-1.5 rounded-full transition-all duration-200",
                            mode === 'light' ? "bg-admin-panel text-primary shadow-sm" : "text-admin-text-muted hover:text-admin-text"
                        )}
                        title="Light Mode"
                    >
                        <Sun className="w-4 h-4"/>
                    </button>
                    <button
                        onClick={() => setMode('system')}
                        className={cn(
                            "p-1.5 rounded-full transition-all duration-200",
                            mode === 'system' ? "bg-admin-panel text-primary shadow-sm" : "text-admin-text-muted hover:text-admin-text"
                        )}
                        title="System Theme"
                    >
                        <Monitor className="w-4 h-4"/>
                    </button>
                    <button
                        onClick={() => setMode('dark')}
                        className={cn(
                            "p-1.5 rounded-full transition-all duration-200",
                            mode === 'dark' ? "bg-admin-panel text-primary shadow-sm" : "text-admin-text-muted hover:text-admin-text"
                        )}
                        title="Dark Mode"
                    >
                        <Moon className="w-4 h-4"/>
                    </button>
                </div>
            </div>
        </>
    )
}