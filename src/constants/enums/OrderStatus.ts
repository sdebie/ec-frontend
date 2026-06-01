import type {LucideIcon} from "lucide-react";

export enum OrderStatus {
    CREATED = "CREATED",
    PENDING = "PENDING",
    PAID = "PAID",
    IN_STORE_PAYMENT = "IN_STORE_PAYMENT",
    IN_TRANSIT = "IN_TRANSIT",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
    FAILED = "FAILED",
    SYSTEM_CANCELED = "SYSTEM_CANCELED"
}

type Option = {
    label: string,
    value: OrderStatus,
    colorClass: string
    icon?: LucideIcon;
}

export const OrderStatusOptions: Option[] = [
    {
        label: 'Created',
        value: OrderStatus.CREATED,
        colorClass: "text-orange-600 bg-orange-100 dark:text-orange-700 dark:bg-orange-200 rounded text-[10px] font-bold"
    },
    {
        label: 'Pending',
        value: OrderStatus.PENDING,
        colorClass: "text-blue-500 bg-blue-100 dark:text-blue-700 dark:bg-blue-200 rounded text-[10px] font-bold"
    },
    {
        label: 'Paid',
        value: OrderStatus.PAID,
        colorClass: "text-green-600 bg-green-100 dark:text-green-700 dark:bg-green-200 rounded text-[10px] font-bold"
    },
    {
        label: 'In Store Payment',
        value: OrderStatus.IN_STORE_PAYMENT,
        colorClass: "text-green-600 bg-green-100 dark:text-green-700 dark:bg-green-200 rounded text-[10px] font-bold"
    },
    {
        label: 'In Transit',
        value: OrderStatus.IN_TRANSIT,
        colorClass: "text-green-600 bg-green-100 dark:text-green-700 dark:bg-green-200 rounded text-[10px] font-bold"
    },
    {
        label: 'Delivered',
        value: OrderStatus.DELIVERED,
        colorClass: "text-green-600 bg-green-100 dark:text-green-700 dark:bg-green-200"
    },
    {
        label: 'Cancelled',
        value: OrderStatus.CANCELLED,
        colorClass: "text-green-600 bg-green-100 dark:text-green-700 dark:bg-green-200"
    },
    {
        label: 'Failed',
        value: OrderStatus.FAILED,
        colorClass: "text-red-600 bg-red-100 dark:text-red-700 dark:bg-red-200"
    },
    {
        label: 'System Cancelled',
        value: OrderStatus.SYSTEM_CANCELED,
        colorClass: "text-green-600 bg-green-100 dark:text-green-700 dark:bg-green-200"
    },
]

export function getOrderStatus(status: OrderStatus | string) {
    return OrderStatusOptions.find((option) => option.value === (status as OrderStatus));
}