import {useEffect} from 'react';
import {useQuery} from '@tanstack/react-query';
import {fetchCountrySettings} from '@/services/StoreSettings';
import {useSettingsStore} from '@/store/settingsStore';

export function useInitializeSettingsStore() {
    const {data} = useQuery({
        queryKey: ['countrySettings'],
        queryFn: fetchCountrySettings,
        // Country settings are session-stable — no need to refetch on focus.
        staleTime: Infinity,
        retry: false,
    });

    useEffect(() => {
        if (!data) return;
        try {
            useSettingsStore.getState().initializeSettings(data);
        } catch (error) {
            console.warn('Failed to initialize settings store', error);
        }
    }, [data]);
}

