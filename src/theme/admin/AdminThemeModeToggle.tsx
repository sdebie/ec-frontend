import {Moon, Sun} from 'lucide-react'
import clsx from 'clsx'
import {useAdminTheme} from '@/theme/admin/useAdminTheme'
import type {AdminThemeMode} from '@/theme/admin/admin-theme.types'
import {ComponentType} from "react";


type ThemeOption = {
    value: AdminThemeMode
    label: string
    icon: ComponentType<{ className?: string }>
}

const options: ThemeOption[] = [
    {value: 'light', label: 'Light', icon: Sun},
    {value: 'dark', label: 'Dark', icon: Moon},
    // { value: 'system', label: 'Auto', icon: Monitor },
]

export default function AdminThemeModeToggle() {
    const {mode, setMode} = useAdminTheme()

    return (
        <div className="flex items-center gap-3">
            <div
                className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
                {options.map((option) => {
                    const Icon = option.icon
                    const active = mode === option.value

                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => setMode(option.value)}
                            aria-pressed={active}
                            className={clsx(
                                'inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-medium transition-all',
                                active
                                    ? 'bg-blue-500 text-white shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
                            )}
                        >
                            <Icon className="h-4 w-4"/>
                            <span>{option.label}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}