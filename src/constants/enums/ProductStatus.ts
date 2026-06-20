import type {LucideIcon} from "lucide-react";

export enum ProductStatus {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    DISABLED = "DISABLED"
}

type Option = {
    label: string,
    value: ProductStatus,
    colorClass: string
    icon?: LucideIcon;
}

export const ProductStatusOptions: Option[] = [
    {
        label: 'Pending',
        value: ProductStatus.PENDING,
        colorClass: "text-orange-600 bg-orange-100 dark:text-orange-700 dark:bg-orange-200 rounded text-[10px] font-bold"
    },
    {
        label: 'Active',
        value: ProductStatus.ACTIVE,
        colorClass: "text-green-600 bg-green-100 dark:text-green-700 dark:bg-green-200 rounded text-[10px] font-bold"
    },
    {
        label: 'Disabled',
        value: ProductStatus.DISABLED,
        colorClass: "text-red-600 bg-red-100 dark:text-red-700 dark:bg-red-200 rounded text-[10px] font-bold"
    },
]

export function getProductStatus(status: ProductStatus | string) {
    return ProductStatusOptions.find((option) => option.value === (status as ProductStatus));
}

