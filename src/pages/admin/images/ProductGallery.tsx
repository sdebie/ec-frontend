import { useEffect, useState } from 'react';
import { IMAGE_BASE_URL } from '@/constants/api.constant.ts';
import { AdaptiveCard, Button } from "@/components";
import { PageContainer } from "@/components/layout/shared/PageContainer.tsx";
import { useNavigate } from "react-router-dom";
import ImageService from "@/services/ImageService.ts";
import { Upload } from 'lucide-react';

const ProductGallery = () => {
    const [images, setImages] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadImages = async () => {
            try {
                const data = await ImageService.fetchImageFilenames();
                setImages(data);
                if (data.length > 0) setSelectedImage(data[0]);
            } catch (error) {
                console.error("Failed to fetch image filenames:", error);
            }
        };

        loadImages();
    }, []);

    return (
        <PageContainer
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
                    <AdaptiveCard className="p-0 overflow-hidden">
                        <div className="w-full h-120 flex items-center justify-center relative">
                            <img
                                src={`${IMAGE_BASE_URL}${selectedImage}`}
                                className="max-w-full max-h-full object-contain p-4"
                                alt="Preview"
                            />
                            <div className="absolute bottom-4 right-4 bg-admin-panel/80 border border-admin-border px-3 py-1 rounded-lg text-sm text-admin-text-muted">
                                {selectedImage}
                            </div>
                        </div>
                    </AdaptiveCard>
                )}

                {/* Thumbnails Grid */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-admin-text border-b border-admin-border pb-2">
                        All Images ({images.length})
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
                                    src={`${IMAGE_BASE_URL}thumbnails/${filename}`}
                                    className="w-full h-full object-cover"
                                    alt={filename}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `${IMAGE_BASE_URL}${filename}`;
                                    }}
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-end p-1 transition">
                                    <span className="text-[10px] truncate w-full text-white">{filename}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>
            </div>
        </PageContainer>
    );
};

export default ProductGallery;