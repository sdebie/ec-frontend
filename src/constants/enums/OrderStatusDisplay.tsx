import {Tag} from "lucide-react";
import React from "react";
import {getOrderStatus, OrderStatus} from "@/constants/enums/OrderStatus.ts";

type Props = {
    status: OrderStatus | string;
};

export const OrderStatusDisplay: React.FC<Props> = ({status}) => {

    const orderStatus = getOrderStatus(status);

    if (!orderStatus) {
        return status;
    }
    return (
        <>
            <div className="flex items-center">
                <div className="mr-2 rtl:ml-2">
                    <Tag className={orderStatus.colorClass}>
                        {orderStatus.icon &&
                            <orderStatus.icon className={`w-4 h-4 mr-1 ${orderStatus.colorClass}`}/>
                        }
                        <span className={`capitalize ${orderStatus.colorClass}`}>{orderStatus.label}</span>
                    </Tag>
                </div>
            </div>
        </>
    );
};