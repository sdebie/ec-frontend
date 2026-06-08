import { CountrySetting } from './types/shared/SettingsTypes'; // Import CountrySetting

interface SystemSettings {
    vatPercentage: number;
    countrySetting: CountrySetting; // Change type to CountrySetting
}

let systemSettings: SystemSettings | null = null;

export async function fetchSystemSettings(): Promise<SystemSettings> {
    // In a real application, this would fetch data from an API
    // For now, we'll use mock data
    return new Promise(resolve => {
        setTimeout(() => {
            systemSettings = {
                vatPercentage: 0.15, // Example VAT 20%
                countrySetting: { // Provide a full CountrySetting object
                    countryCode: 'ZA',
                    countryName: 'South Africa',
                    currencyCode: 'ZAR',
                    locale: 'en-ZA',
                    decimalPlaces: 2,
                    isDefault: true,
                    isActive: true,
                },
            };
            resolve(systemSettings);
        }, 100); // Simulate network delay
    });
}

export function getSystemSettings(): SystemSettings | null {
    return systemSettings;
}