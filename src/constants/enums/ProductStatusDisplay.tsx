import React from "react";
import {getProductStatus, ProductStatus} from "@/constants/enums/ProductStatus.ts";

type Props = {
    status: ProductStatus | string;
};

export const ProductStatusDisplay: React.FC<Props> = ({status}) => {

    const productStatus = getProductStatus(status);

    if (!productStatus) {
        return status;
    }
    return (
        <>
            <div className="flex items-center">
                <div className="mr-2 rtl:ml-2">
                    {productStatus.icon &&
                        <productStatus.icon className={`w-4 h-4 mr-1 ${productStatus.colorClass}`}/>
                    }
                    <span className={`capitalize ${productStatus.colorClass}`}>{productStatus.label}</span>
                </div>
            </div>
        </>
    );
};

