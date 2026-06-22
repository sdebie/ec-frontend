import type {LucideIcon} from "lucide-react";

export enum WholesaleCustomerStatus {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    DISABLED = "DISABLED",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    CONVERTED = "CONVERTED",
}

type Option = {
    label: string,
    value: WholesaleCustomerStatus,
    colorClass: string
    icon?: LucideIcon;
}

export const WholesaleCustomerStatusOptions: Option[] = [
    {
        label: 'Pending',
        value: WholesaleCustomerStatus.PENDING,
        colorClass: "text-blue-500 bg-blue-100 dark:text-blue-700 dark:bg-blue-200"
    },
    {
        label: 'Active',
        value: WholesaleCustomerStatus.ACTIVE,
        colorClass: "text-green-600 bg-green-100 dark:text-green-700 dark:bg-green-200"
    },
    {
        label: 'Disabled',
        value: WholesaleCustomerStatus.DISABLED,
        colorClass: "text-red-600 bg-red-100 dark:text-red-700 dark:bg-red-200"
    },
    {
        label: 'Approved',
        value: WholesaleCustomerStatus.APPROVED,
        colorClass: "text-green-600 bg-green-100 dark:text-green-700 dark:bg-green-200"
    },
    {
        label: 'Rejected',
        value: WholesaleCustomerStatus.REJECTED,
        colorClass: "text-red-600 bg-red-100 dark:text-red-700 dark:bg-red-200"
    },
    {
        label: 'Converted',
        value: WholesaleCustomerStatus.CONVERTED,
        colorClass: "text-orange-600 bg-orange-100 dark:text-orange-700 dark:bg-orange-200"
    },
]

export function getWholesaleCustomerStatus(status: WholesaleCustomerStatus | string) {
    return WholesaleCustomerStatusOptions.find((option) => option.value === (status as WholesaleCustomerStatus));
}


