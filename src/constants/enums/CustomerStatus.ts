import type {LucideIcon} from "lucide-react";

export enum CustomerStatus {
    ACTIVE = "ACTIVE",
    DISABLED = "DISABLED",
    PENDING = "PENDING",
}

type Option = {
    label: string,
    value: CustomerStatus,
    colorClass: string
    icon?: LucideIcon;
}

export const CustomerStatusOptions: Option[] = [
    {
        label: 'Active',
        value: CustomerStatus.ACTIVE,
        colorClass: "text-orange-600 bg-orange-100 dark:text-orange-700 dark:bg-orange-200"
    },
    {
        label: 'Disabled',
        value: CustomerStatus.DISABLED,
        colorClass: "text-blue-500 bg-blue-100 dark:text-blue-700 dark:bg-blue-200"
    },
    {
        label: 'Pending Registration',
        value: CustomerStatus.PENDING,
        colorClass: "text-blue-500 bg-blue-100 dark:text-blue-700 dark:bg-blue-200"
    },
]

export function getCustomerStatus(status: CustomerStatus | string) {
    return CustomerStatusOptions.find((option) => option.value === (status as CustomerStatus));
}