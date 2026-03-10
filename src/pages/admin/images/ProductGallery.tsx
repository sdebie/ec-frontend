import { useEffect, useState } from 'react';
import { IMAGE_BASE_URL } from '@/constants/api.constant.ts';
import {Button} from "@/components";
import {useNavigate} from "react-router-dom";
import ImageService from "@/services/ImageService.ts";

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

    const bulkUpload = async () => {
        navigate('/admin/imports/images/bulk-upload/');
    };

    return (
        <div className="flex flex-col gap-6 p-6 bg-slate-900 min-h-screen text-white">
            <h2 className="text-2xl font-bold">Product Image Library</h2>
            <Button onClick={bulkUpload} className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded font-medium transition">
                Bulk Upload Images
            </Button>
            {/* 1. Feature Preview */}
            {selectedImage && (
                <div className="w-full h-[500px] bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden flex items-center justify-center relative">
                    <img
                        src={`${IMAGE_BASE_URL}${selectedImage}`}
                        className="max-w-full max-h-full object-contain p-4"
                        alt="Preview"
                    />
                    <div className="absolute bottom-4 right-4 bg-black/50 px-3 py-1 rounded text-sm">
                        {selectedImage}
                    </div>
                </div>
            )}

            {/* 2. Scrollable Thumbnails Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {images.map((filename) => (
                    <button
                        key={filename}
                        onClick={() => setSelectedImage(filename)}
                        className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition ${
                            selectedImage === filename ? 'border-blue-500 scale-95' : 'border-slate-700 hover:border-slate-500'
                        }`}
                    >
                        <img
                            src={`${IMAGE_BASE_URL}thumbnails/${filename}`}
                            className="w-full h-full object-cover"
                            alt={filename}
                            onError={(e) => {
                                // Fallback if no thumbnail exists
                                (e.target as HTMLImageElement).src = `${IMAGE_BASE_URL}${filename}`;
                            }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-end p-1 transition">
                            <span className="text-[10px] truncate w-full">{filename}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ProductGallery;