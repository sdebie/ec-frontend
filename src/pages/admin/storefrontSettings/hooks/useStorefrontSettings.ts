import {useEffect, useState} from 'react';
import {apiGetStoreSettings, apiUpdateSetting} from '@/services/graphql/admin/settings/SettingsService.graphql.ts';
import {
    STOREFRONT_SETTING_KEYS,
    StorefrontSettings,
    StorefrontThemeSection,
} from '@/types/admin/StorefrontSettingsTypes';

const DEFAULT_THEME: StorefrontThemeSection = {
    background: '#f8fafc',
    panel: '#ffffff',
    text: '#0f172a',
    mutedText: '#64748b',
    accent: '#2563eb',
    accentText: '#ffffff',
    border: '#e2e8f0',
};

const DEFAULTS: StorefrontSettings = {
    config: {slug: '', displayName: ''},
    branding: {name: ''},
    theme: DEFAULT_THEME,
    navigation: {items: []},
    footer: {columns: [], socialLinks: [], legalLinks: []},
    homeSections: [],
};

export function useStorefrontSettings() {
    const [settings, setSettings] = useState<StorefrontSettings>(DEFAULTS);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const rows = await apiGetStoreSettings();
                const parsed: Partial<StorefrontSettings> = {};

                for (const row of rows) {
                    if (!row.key.startsWith('storefront.')) continue;
                    try {
                        const section = JSON.parse(row.value);
                        switch (row.key) {
                            case STOREFRONT_SETTING_KEYS.CONFIG:
                                parsed.config = section;
                                break;
                            case STOREFRONT_SETTING_KEYS.BRANDING:
                                parsed.branding = section;
                                break;
                            case STOREFRONT_SETTING_KEYS.THEME:
                                parsed.theme = section;
                                break;
                            case STOREFRONT_SETTING_KEYS.NAVIGATION:
                                parsed.navigation = section;
                                break;
                            case STOREFRONT_SETTING_KEYS.FOOTER:
                                parsed.footer = section;
                                break;
                            case STOREFRONT_SETTING_KEYS.HOME_SECTIONS:
                                parsed.homeSections = section;
                                break;
                        }
                    } catch {
                        // skip malformed rows
                    }
                }

                setSettings(prev => ({...prev, ...parsed}));
            } catch {
                setError('Failed to load storefront settings');
            } finally {
                setIsLoading(false);
            }
        };

        load();
    }, []);

    const saveSection = async (key: string, data: unknown): Promise<boolean> => {
        try {
            await apiUpdateSetting(key, JSON.stringify(data));
            return true;
        } catch {
            return false;
        }
    };

    return {settings, isLoading, error, saveSection};
}
