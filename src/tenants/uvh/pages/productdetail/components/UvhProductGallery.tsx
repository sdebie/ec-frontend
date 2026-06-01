import {useEffect, useState} from 'react';
import ProductImage from '@/components/shared/imageupload/ProductImage.tsx';
import {cn} from '@/utils/cn';

type UvhProductGalleryProps = {
    productName: string;
    images: { id: string; imageUrl: string }[];
};

export function UvhProductGallery({productName, images}: UvhProductGalleryProps) {
    const galleryImages = images.length > 0 ? images : [];
    const [activeIndex, setActiveIndex] = useState(0);
    const activeImage = galleryImages[activeIndex]?.imageUrl;
    const hasThumbnails = galleryImages.length > 1;

    useEffect(() => {
        setActiveIndex(0);
    }, [images]);

    return (
        <div className="relative min-w-0 overflow-hidden rounded-xl border border-(--sf-border) bg-(--sf-bg) aspect-square max-h-120">
            {activeImage ? (
                <ProductImage
                    fileName={activeImage}
                    alt={productName}
                    className="h-full w-full object-contain p-6"
                />
            ) : (
                <div className="flex h-full items-center justify-center text-sm text-(--sf-muted-text)">
                    No image available
                </div>
            )}

            {/* Thumbnail strip overlaid at the bottom */}
            {hasThumbnails && (
                <div className="absolute bottom-0 inset-x-0 flex justify-center gap-2 bg-linear-to-t from-black/30 to-transparent px-4 pb-3 pt-6">
                    {galleryImages.map((image, index) => (
                        <button
                            key={image.id}
                            type="button"
                            aria-label={`View image ${index + 1}`}
                            aria-current={index === activeIndex ? 'true' : undefined}
                            onClick={() => setActiveIndex(index)}
                            className={cn(
                                'h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 bg-(--sf-bg) transition',
                                index === activeIndex
                                    ? 'border-(--sf-accent)'
                                    : 'border-white/60 hover:border-(--sf-accent)/80',
                            )}
                        >
                            <ProductImage
                                fileName={image.imageUrl}
                                alt={`${productName} thumbnail ${index + 1}`}
                                className="h-full w-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
