import type {LucideIcon} from "lucide-react";

export enum ProductImportValidationStatus {
    VALID = "VALID",
    INVALID = "INVALID",
}

type Option = {
    label: string,
    value: ProductImportValidationStatus,
    colorClass: string
    icon?: LucideIcon;
}

export const ProductImportValidationStatusOptions: Option[] = [
    {
        label: 'Valid',
        value: ProductImportValidationStatus.VALID,
        colorClass: "px-2 py-1 text-green-500/20 bg-blue-100 dark:text-blue-700 dark:bg-blue-200 rounded text-[10px] font-bold"
    },
    {
        label: 'Invalid !!',
        value: ProductImportValidationStatus.INVALID,
        colorClass: "px-2 py-1 text-red-500/20 bg-red-100 dark:text-red-700 dark:bg-red-100 rounded text-[10px] font-bold"
    },
]

export function getProductImportValidationStatus(status: ProductImportValidationStatus | string) {
    return ProductImportValidationStatusOptions.find((option) => option.value === (status as ProductImportValidationStatus));
}