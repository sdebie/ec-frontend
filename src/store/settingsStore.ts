import { create } from 'zustand';
import type { CountrySetting } from '@/types/shared/SettingsTypes';
import { getDefaultCountrySetting, createCountryMoneyFormatter, formatAmount } from '@/utils/formatAmount';

type SettingsState = {
    countrySettings: CountrySetting[];
    activeCountrySetting: CountrySetting | null;
    isLoading: boolean;
    error: string | null;
    setCountrySettings: (settings: CountrySetting[]) => void;
    initializeSettings: (settings: CountrySetting[]) => void;
    reset: () => void;
};

const initialState = {
    countrySettings: [],
    activeCountrySetting: null,
    isLoading: false,
    error: null,
};

export const useSettingsStore = create<SettingsState>((set) => ({
    ...initialState,

    setCountrySettings: (settings: CountrySetting[]) => {
        const active = getDefaultCountrySetting(settings);
        set({
            countrySettings: settings,
            activeCountrySetting: active,
            error: null,
        });
    },

    initializeSettings: (settings: CountrySetting[]) => {
        set((state) => ({
            ...state,
            countrySettings: settings,
            activeCountrySetting: getDefaultCountrySetting(settings),
            isLoading: false,
        }));
    },

    reset: () => set(() => ({ ...initialState })),
}));

export function getActiveFormatter() {
    const state = useSettingsStore.getState();
    return state.activeCountrySetting
        ? createCountryMoneyFormatter(state.activeCountrySetting)
        : (amount?: number | null) => formatAmount(amount);
}

