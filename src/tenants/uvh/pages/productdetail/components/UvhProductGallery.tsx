import { ZoomIn } from 'lucide-react';
import { useEffect, useState } from 'react';

import ProductImage from '@/components/shared/imageupload/ProductImage.tsx';
import { IMAGE_BASE_URL } from '@/constants/api.constant.ts';
import { cn } from '@/utils/cn';

type UvhProductGalleryProps = {
    productName: string;
    images: { id: string; imageUrl: string }[];
};

export function UvhProductGallery({ productName, images }: UvhProductGalleryProps) {
    const galleryImages = images.length > 0 ? images : [];
    const [activeIndex, setActiveIndex] = useState(0);
    const [zoomOpen, setZoomOpen] = useState(false);

    const activeImage = galleryImages[activeIndex]?.imageUrl;

    useEffect(() => {
        setActiveIndex(0);
    }, [images]);

    useEffect(() => {
        if (!zoomOpen) return;
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setZoomOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [zoomOpen]);

    return (
        <div className="flex gap-3">
            {/* Vertical thumbnail strip */}
            {galleryImages.length > 1 ? (
                <div className="flex flex-col gap-2">
                    {galleryImages.map((image, index) => (
                        <button
                            key={image.id}
                            type="button"
                            aria-label={`View image ${index + 1}`}
                            aria-current={index === activeIndex ? 'true' : undefined}
                            onClick={() => setActiveIndex(index)}
                            className={cn(
                                'h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-(--sf-bg) transition',
                                index === activeIndex
                                    ? 'border-(--sf-accent)'
                                    : 'border-(--sf-border) hover:border-(--sf-accent)/60',
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
            ) : null}

            {/* Main image */}
            <div className="relative min-w-0 flex-1 overflow-hidden rounded-xl border border-(--sf-border) bg-(--sf-bg) aspect-square max-h-[480px]">
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

                {activeImage ? (
                    <button
                        type="button"
                        aria-label="Zoom product image"
                        className="absolute left-3 top-3 rounded-full border border-(--sf-border) bg-(--sf-panel) p-2 text-(--sf-text) shadow-sm transition hover:border-(--sf-accent) hover:text-(--sf-accent)"
                        onClick={() => setZoomOpen(true)}
                    >
                        <ZoomIn className="h-4 w-4" />
                    </button>
                ) : null}
            </div>

            {/* Zoom modal */}
            {zoomOpen && activeImage ? (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`${productName} enlarged`}
                    onClick={() => setZoomOpen(false)}
                >
                    <button
                        type="button"
                        className="absolute right-4 top-4 rounded-lg bg-(--sf-panel) px-3 py-1.5 text-sm font-medium text-(--sf-text)"
                        onClick={() => setZoomOpen(false)}
                    >
                        Close
                    </button>
                    <img
                        src={`${IMAGE_BASE_URL}${activeImage}`}
                        alt={productName}
                        className="max-h-[90vh] max-w-full object-contain"
                        onClick={(event) => event.stopPropagation()}
                        onError={(event) => {
                            const target = event.target as HTMLImageElement;
                            target.src = '/img/default-product.png';
                        }}
                    />
                </div>
            ) : null}
        </div>
    );
}
