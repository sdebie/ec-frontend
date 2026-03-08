import {useAdminTheme} from "@/hooks/useAdminTheme.ts";
import {ThemePreset} from "@/context/AdminThemeContext.tsx";
import {cn} from "@/utils/cn.ts";

const Settings = () => {
    const {preset, setPreset} = useAdminTheme();

    const presets: { id: ThemePreset; name: string; colorClass: string }[] = [
        {id: 'blue', name: 'Blue', colorClass: 'bg-blue-500'},
        {id: 'purple', name: 'Purple', colorClass: 'bg-purple-500'},
        {id: 'green', name: 'Green', colorClass: 'bg-emerald-500'},
        {id: 'orange', name: 'Orange', colorClass: 'bg-orange-500'},
        {id: 'red', name: 'Red', colorClass: 'bg-red-500'},
    ];

    return (
        <>
            <div className="grid gap-6">
                <div
                    className="bg-admin-panel border border-admin-border rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] overflow-hidden">
                    <div className="p-6 border-b border-admin-border">
                        <h2 className="text-lg font-semibold text-admin-text">Appearance</h2>
                        <p className="text-sm text-admin-text-muted mt-1">Customize the look and feel of your admin
                            dashboard.</p>
                    </div>

                    <div className="p-6">
                        <h3 className="text-sm font-medium text-admin-text mb-4">Theme Preset Theme Color</h3>
                        <div className="flex flex-wrap gap-4">
                            {presets.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => setPreset(p.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200",
                                        preset === p.id
                                            ? "border-primary bg-primary-subtle ring-1 ring-primary"
                                            : "border-admin-border bg-admin-panel hover:bg-admin-sidebar-hover"
                                    )}
                                >
                                    <span className={cn("w-4 h-4 rounded-full", p.colorClass)}/>
                                    <span className="text-sm font-medium text-admin-text">{p.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Settings;
