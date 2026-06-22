import React from "react";
import {getWholesaleApplicationStatus, WholesaleApplicationStatus} from "@/constants/enums/WholesaleApplicationStatus.ts";

type Props = {
    status: WholesaleApplicationStatus | string;
};

export const WholesaleApplicationStatusDisplay: React.FC<Props> = ({status}) => {

    const applicationStatus = getWholesaleApplicationStatus(status);

    if (!applicationStatus) {
        return status;
    }
    return (
        <>
            <div className="flex items-center">
                <div className="mr-2 rtl:ml-2">
                    {applicationStatus.icon &&
                        <applicationStatus.icon className={`w-4 h-4 mr-1 ${applicationStatus.colorClass}`}/>
                    }
                    <span className={`capitalize ${applicationStatus.colorClass}`}>{applicationStatus.label}</span>
                </div>
            </div>
        </>
    );
};


