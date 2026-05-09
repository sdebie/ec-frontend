import {ThemePreset} from "@/context/AdminThemeContext.tsx";
import {useAdminTheme} from "@/hooks/useAdminTheme.ts";
import {Card} from "@/primitives/card";
import {cn} from "@/utils/cn.ts";

const GeneralSettings = () => {
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
            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-admin-text border-b border-admin-border pb-2">
                    Appearance
                </h2>
                <Card>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-admin-text mb-1">Theme Preset</h3>
                            <p className="text-xs text-admin-text-muted mb-4">
                                Customize the look and feel of your admin dashboard.
                            </p>
                        </div>
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
                </Card>
            </section>
        </>
    );
};

export default GeneralSettings;
