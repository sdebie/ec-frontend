import { Loader, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

import { PageLayout } from "@/components";
import { IMAGE_BASE_URL } from '@/constants/api.constant.ts';
import { Button } from '@/primitives/button';
import { Card } from '@/primitives/card';
import ImageServiceRest from "@/services/rest/admin/ImageService.rest.ts";

const PAGE_SIZE = 80;

const ProductGallery = () => {
    const [images, setImages] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const loadImages = async (page: number) => {
        setIsLoading(true);
        try {
            const response = await ImageServiceRest.fetchImageFilenamesPaginated(page, PAGE_SIZE);
            setImages(response.images || []);
            setTotalCount(response.totalCount || 0);
            setCurrentPage(response.page || 0);

            if (!selectedImage && response.images.length > 0) {
                setSelectedImage(response.images[0]);
            }
        } catch (error) {
            console.error("Failed to fetch paginated image filenames:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadImages(0);
    }, []);

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);
    const canLoadMore = images.length < totalCount && currentPage < totalPages - 1;

    return (
        <PageLayout
            title="Product Image Library"
            description="Browse and manage all product images in your store."
            action={
                <Button
                    variant="solid"
                    leftIcon={<Upload className="w-4 h-4" />}
                    onClick={() => navigate('/admin/imports/images/bulk-upload/')}
                >
                    Bulk Upload Images
                </Button>
            }
        >
            <div className="flex flex-col gap-6">
                {/* Feature Preview */}
                {selectedImage && (
                    <Card className="p-0 overflow-hidden">
                        <div className="w-full h-120 flex items-center justify-center relative">
                            <img
                                src={`${IMAGE_BASE_URL}${selectedImage}`.replace('//', '/')}
                                className="max-w-full max-h-full object-contain p-4"
                                alt="Preview"
                            />
                            <div className="absolute bottom-4 right-4 bg-admin-panel/80 border border-admin-border px-3 py-1 rounded-lg text-sm text-admin-text-muted">
                                {selectedImage}
                            </div>
                        </div>
                    </Card>
                )}

                {/* Thumbnails Grid */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-admin-text border-b border-admin-border pb-2">
                        All Images ({images.length} of {totalCount})
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                        {images.map((filename) => (
                            <button
                                key={filename}
                                onClick={() => setSelectedImage(filename)}
                                className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition ${
                                    selectedImage === filename
                                        ? 'border-blue-500 scale-95'
                                        : 'border-admin-border hover:border-admin-text-muted'
                                }`}
                            >
                                <img
                                    src={`${IMAGE_BASE_URL}thumbnails/${filename}`.replace('//', '/')}
                                    className="w-full h-full object-cover"
                                    alt={filename}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `${IMAGE_BASE_URL}${filename}`.replace('//', '/');
                                    }}
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-end p-1 transition">
                                    <span className="text-[10px] truncate w-full text-white">{filename}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {canLoadMore && (
                        <div className="pt-2">
                            <Button
                                variant="secondary"
                                className="w-full"
                                disabled={isLoading}
                                onClick={() => loadImages(currentPage + 1)}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader className="w-4 h-4 animate-spin mr-2" />
                                        Loading...
                                    </>
                                ) : (
                                    `Load More (${images.length} of ${totalCount})`
                                )}
                            </Button>
                        </div>
                    )}
                </section>
            </div>
        </PageLayout>
    );
};

export default ProductGallery;