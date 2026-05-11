import type { PropsWithChildren } from 'react';
import { useInitializeSettingsStore } from '@/hooks/useInitializeSettingsStore';

export function SettingsInitializationProvider({ children }: PropsWithChildren) {
    useInitializeSettingsStore();
    return children;
}

