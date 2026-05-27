import { useCallback } from 'react';
import { useSettingsStore, getActiveFormatter } from '@/store/settingsStore';

export function useFormatAmount() {
    const activeCountrySetting = useSettingsStore((state) => state.activeCountrySetting);

    const format = useCallback(
        (amount?: number | null) => {
            if (!activeCountrySetting) {
                // Fallback if settings not loaded yet
                return getActiveFormatter()?.(amount);
            }

            // Use the pre-configured formatter based on active country
            const formatter = getActiveFormatter();
            return formatter(amount);
        },
        [activeCountrySetting]
    );

    return {
        format,
        activeCountrySetting,
    };
}



