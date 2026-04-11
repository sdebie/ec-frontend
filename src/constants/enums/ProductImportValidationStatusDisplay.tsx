import {Tag} from "lucide-react";
import React from "react";
import {
    getProductImportValidationStatus,
    ProductImportValidationStatus
} from "@/constants/enums/ProductImportValidationStatus.ts";

type Props = {
    status: ProductImportValidationStatus | string;
};

export const ProductImportValidationStatusDisplay: React.FC<Props> = ({status}) => {

    const validStatus = getProductImportValidationStatus(status);

    if (!validStatus) {
        return status;
    }
    return (
        <>
            <div className="flex items-center">
                <div className="mr-2 rtl:ml-2">
                    <Tag className={validStatus.colorClass}>
                        {validStatus.icon &&
                            <validStatus.icon className={`w-4 h-4 mr-1 ${validStatus.colorClass}`}/>
                        }
                        <span className={`capitalize ${validStatus.colorClass}`}>{validStatus.label}</span>
                    </Tag>
                </div>
            </div>
        </>
    );
};