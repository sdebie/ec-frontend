import React from "react";
import {getWholesaleCustomerStatus, WholesaleCustomerStatus} from "@/constants/enums/WholesaleCustomerStatus.ts";

type Props = {
    status: WholesaleCustomerStatus | string;
};

export const WholesaleCustomerStatusDisplay: React.FC<Props> = ({status}) => {

    const customerStatus = getWholesaleCustomerStatus(status);

    if (!customerStatus) {
        return status;
    }
    return (
        <>
            <div className="flex items-center">
                <div className="mr-2 rtl:ml-2">
                    {customerStatus.icon &&
                        <customerStatus.icon className={`w-4 h-4 mr-1 ${customerStatus.colorClass}`}/>
                    }
                    <span className={`capitalize ${customerStatus.colorClass}`}>{customerStatus.label}</span>
                </div>
            </div>
        </>
    );
};


