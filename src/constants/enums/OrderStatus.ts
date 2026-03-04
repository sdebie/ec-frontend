import {IconType} from "react-icons";

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
    icon?: IconType;
}

export const OrderStatusOptions: Option[] = [
    {
        label: 'Created',
        value: OrderStatus.CREATED,
        colorClass: "text-orange-600 bg-orange-100 dark:text-orange-700 dark:bg-orange-200"
    },
    {
        label: 'PENDING',
        value: OrderStatus.PENDING,
        colorClass: "text-blue-500 bg-blue-100 dark:text-blue-700 dark:bg-blue-200"
    },
    {
        label: 'PAID',
        value: OrderStatus.PAID,
        colorClass: "text-green-600 bg-green-100 dark:text-green-700 dark:bg-green-200"
    },
    {
        label: 'IN_STORE_PAYMENT',
        value: OrderStatus.IN_STORE_PAYMENT,
        colorClass: "text-green-600 bg-green-100 dark:text-green-700 dark:bg-green-200"
    },
    {
        label: 'IN_TRANSIT',
        value: OrderStatus.IN_TRANSIT,
        colorClass: "text-green-600 bg-green-100 dark:text-green-700 dark:bg-green-200"
    },
    {
        label: 'DELIVERED',
        value: OrderStatus.DELIVERED,
        colorClass: "text-green-600 bg-green-100 dark:text-green-700 dark:bg-green-200"
    },
    {
        label: 'CANCELLED',
        value: OrderStatus.CANCELLED,
        colorClass: "text-green-600 bg-green-100 dark:text-green-700 dark:bg-green-200"
    },
    {
        label: 'FAILED',
        value: OrderStatus.FAILED,
        colorClass: "text-red-600 bg-red-100 dark:text-red-700 dark:bg-red-200"
    },
    {
        label: 'SYSTEM_CANCELED',
        value: OrderStatus.SYSTEM_CANCELED,
        colorClass: "text-green-600 bg-green-100 dark:text-green-700 dark:bg-green-200"
    },
]

export function getOrderStatus(status: OrderStatus | string) {
    return OrderStatusOptions.find((option) => option.value === (status as OrderStatus));
}