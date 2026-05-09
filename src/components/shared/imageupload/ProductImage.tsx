import {IMAGE_BASE_URL} from "@/constants/api.constant.ts";

import type {FC} from 'react';


interface ProductImageProps {
    fileName: string;
    alt: string;
    className?: string;
}

const ProductImage: FC<ProductImageProps> = ({fileName, alt, className}) => {
    // Construct the full path using your local Quarkus server address
    const src = `${IMAGE_BASE_URL}${fileName}`;
    console.log("ProductImage :" + src)
    return (
        <img
            src={src}
            alt={alt}
            className={className || "w-full h-48 object-cover rounded-md"}
            // Error handling: if the file isn't found in your local storage folder
            onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/img/default-product.png'; // Local fallback
            }}
        />
    );
};

export default ProductImage;