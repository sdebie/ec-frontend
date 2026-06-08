import type {LucideIcon} from "lucide-react";

export enum ProductType {
    VARIABLE = "VARIABLE",
    SIMPLE = "SIMPLE"
}

type Option = {
    label: string,
    value: ProductType,
    colorClass: string
    icon?: LucideIcon;
}

export const ProductTypeOptions: Option[] = [
    {
        label: 'Variable',
        value: ProductType.VARIABLE,
        colorClass: "text-orange-600 bg-orange-100 dark:text-orange-700 dark:bg-orange-200"
    },
    {
        label: 'Simple',
        value: ProductType.SIMPLE,
        colorClass: "text-blue-500 bg-blue-100 dark:text-blue-700 dark:bg-blue-200"
    },
]

export function getProductType(status: ProductType | string) {
    return ProductTypeOptions.find((option) => option.value === (status as ProductType));
}