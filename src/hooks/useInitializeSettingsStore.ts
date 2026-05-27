import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { fetchCountrySettings } from '@/services/StoreSettings';

export function useInitializeSettingsStore() {
    useEffect(() => {
        const initializeSettings = async () => {
            try {
                const settings = await fetchCountrySettings();
                useSettingsStore.getState().initializeSettings(settings);
            } catch (error) {
                console.warn('Failed to load country settings on app startup', error);
                // App will use defaults from formatAmount utility
            }
        };

        initializeSettings();
    }, []);
}

