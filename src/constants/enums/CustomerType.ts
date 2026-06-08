import type {LucideIcon} from "lucide-react";

export enum CustomerType {
    GUEST = "GUEST",
    RETAILER = "RETAILER",
    WHOLESALER = "WHOLESALER",
}

type Option = {
    label: string,
    value: CustomerType,
    colorClass: string
    icon?: LucideIcon;
}

export const CustomerTypeOptions: Option[] = [
    {
        label: 'Guest',
        value: CustomerType.GUEST,
        colorClass: "text-orange-600 bg-orange-100 dark:text-orange-700 dark:bg-orange-200"
    },
    {
        label: 'Retail Customer',
        value: CustomerType.RETAILER,
        colorClass: "text-blue-500 bg-blue-100 dark:text-blue-700 dark:bg-blue-200"
    },
    {
        label: 'Wholesaler',
        value: CustomerType.WHOLESALER,
        colorClass: "text-blue-500 bg-blue-100 dark:text-blue-700 dark:bg-blue-200"
    },
]

export function getCustomerType(status: CustomerType | string) {
    return CustomerTypeOptions.find((option) => option.value === (status as CustomerType));
}