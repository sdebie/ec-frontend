import type {LucideIcon} from "lucide-react";

export enum WholesaleApplicationStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    CONVERTED = "CONVERTED",
}

type Option = {
    label: string,
    value: WholesaleApplicationStatus,
    colorClass: string
    icon?: LucideIcon;
}

export const WholesaleApplicationStatusOptions: Option[] = [
    {
        label: 'Pending Review',
        value: WholesaleApplicationStatus.PENDING,
        colorClass: "text-blue-500 bg-blue-100 dark:text-blue-700 dark:bg-blue-200"
    },
    {
        label: 'Approved',
        value: WholesaleApplicationStatus.APPROVED,
        colorClass: "text-green-600 bg-green-100 dark:text-green-700 dark:bg-green-200"
    },
    {
        label: 'Rejected',
        value: WholesaleApplicationStatus.REJECTED,
        colorClass: "text-red-600 bg-red-100 dark:text-red-700 dark:bg-red-200"
    },
    {
        label: 'Converted to Customer',
        value: WholesaleApplicationStatus.CONVERTED,
        colorClass: "text-orange-600 bg-orange-100 dark:text-orange-700 dark:bg-orange-200"
    },
]

export function getWholesaleApplicationStatus(status: WholesaleApplicationStatus | string) {
    return WholesaleApplicationStatusOptions.find((option) => option.value === (status as WholesaleApplicationStatus));
}

