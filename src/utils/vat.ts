import { getSystemSettings } from '../settings';

export type VatCalculation = {
    baseAmount: number;
    vatRatePercent: number;
    vatAmount: number;
    totalIncludingVat: number;
};

function roundCurrency(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function parseVatRate(value?: string | number | null): number {
    const numeric = typeof value === "string" ? Number.parseFloat(value) : Number(value ?? 0);
    if (!Number.isFinite(numeric) || numeric < 0) {
        return 0;
    }
    return numeric;
}

export function calculateVatFromExclusive(baseAmount: number, vatRatePercent?: number | null): VatCalculation {
    const safeBaseAmount = Number.isFinite(baseAmount) && baseAmount > 0 ? baseAmount : 0;
    
    let actualVatRatePercent = vatRatePercent;
    if (actualVatRatePercent === undefined || actualVatRatePercent === null) {
        const settings = getSystemSettings();
        if (settings) {
            actualVatRatePercent = settings.vatPercentage * 100; // Convert decimal to percentage
        } else {
            console.warn("System settings not loaded, using default VAT rate of 0.");
            actualVatRatePercent = 0;
        }
    }

    const safeVatRate = parseVatRate(actualVatRatePercent);
    const vatAmount = roundCurrency((safeBaseAmount * safeVatRate) / 100);

    return {
        baseAmount: roundCurrency(safeBaseAmount),
        vatRatePercent: safeVatRate,
        vatAmount,
        totalIncludingVat: roundCurrency(safeBaseAmount + vatAmount),
    };
}