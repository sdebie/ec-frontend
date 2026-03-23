import {IconType} from "react-icons";

export enum ProductImportValidationStatus {
    VALID = "VALID",
    INVALID = "INVALID",
}

type Option = {
    label: string,
    value: ProductImportValidationStatus,
    colorClass: string
    icon?: IconType;
}

export const ProductImportValidationStatusOptions: Option[] = [
    {
        label: 'Valid',
        value: ProductImportValidationStatus.VALID,
        colorClass: "text-orange-600 bg-orange-100 dark:text-orange-700 dark:bg-orange-200"
    },
    {
        label: 'Invalid',
        value: ProductImportValidationStatus.INVALID,
        colorClass: "text-red-600 bg-red-100 dark:text-red-700 dark:bg-red-200"
    },
]

export function getProductImportValidationStatus(status: ProductImportValidationStatus | string) {
    return ProductImportValidationStatusOptions.find((option) => option.value === (status as ProductImportValidationStatus));
}