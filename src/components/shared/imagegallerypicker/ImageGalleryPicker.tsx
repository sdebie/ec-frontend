import {IMAGE_BASE_URL} from "@/constants/api.constant.ts";
import {useState, useCallback, useEffect, useRef} from "react";
import {Input, Button} from "@/components";
import {Check, Loader} from "lucide-react";
import ImageServiceRest from "@/services/rest/admin/ImageService.rest.ts";

interface ImageGalleryPickerProps {
    images?: string[];
    selectedImageId?: string | null;
    onSelect: (imageId: string) => void;
    pageSize?: number;
    enablePagination?: boolean;
}

const DEBOUNCE_DELAY = 300;
const DEFAULT_PAGE_SIZE = 30;

export const ImageGalleryPicker = ({
                                       images: initialImages = [],
                                       selectedImageId,
                                       onSelect,
                                       pageSize = DEFAULT_PAGE_SIZE,
                                       enablePagination = true,
                                   }: ImageGalleryPickerProps) => {

    const [searchQuery, setSearchQuery] = useState("");
    const [images, setImages] = useState<string[]>(initialImages);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const fetchImages = useCallback(async (page: number, search: string) => {
        if (!enablePagination && !search && initialImages.length > 0) {
            setImages(initialImages);
            return;
        }

        setIsLoading(true);
        try {
            const response = await ImageServiceRest.fetchImageFilenamesPaginated(
                page,
                pageSize,
                search
            );

            // Handle both paginated response and legacy array response
            if (Array.isArray(response)) {
                setImages(response);
                setTotalCount(response.length);
                setCurrentPage(0);
            } else if (response && typeof response === 'object' && 'images' in response) {
                setImages(response.images || []);
                setTotalCount(response.totalCount || 0);
                setCurrentPage(response.page || 0);
            } else {
                setImages([]);
                setTotalCount(0);
                setCurrentPage(0);
            }
        } catch (error) {
            console.error("Failed to fetch paginated images:", error);
            setImages([]);
            setTotalCount(0);
            setCurrentPage(0);
        } finally {
            setIsLoading(false);
        }
    }, [enablePagination, initialImages, pageSize]);

    useEffect(() => {
        if (!enablePagination && initialImages.length > 0) {
            setImages(initialImages);
            return;
        }

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            fetchImages(0, searchQuery);
        }, DEBOUNCE_DELAY);

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [searchQuery, enablePagination, initialImages, fetchImages]);

    const handleLoadMore = () => {
        fetchImages(currentPage + 1, searchQuery);
    };

    const hasMorePages = enablePagination && images.length < totalCount;
    const totalPages = Math.ceil(totalCount / pageSize);
    const canLoadMore = hasMorePages && currentPage < totalPages - 1;

    return (
        <div className="space-y-3">
            <Input
                placeholder="Search images by filename..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                disabled={isLoading && !images.length}
            />

            {isLoading && images.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-admin-text-muted">
                    <Loader className="w-5 h-5 animate-spin mr-2"/>
                    Loading images...
                </div>
            ) : images.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-admin-text-muted text-sm">
                    {searchQuery ? `No images match "${searchQuery}"` : "No images available"}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {images.map((filename) => (
                            <button
                                key={filename}
                                onClick={() => onSelect(filename)}
                                className={`group relative aspect-square rounded-md overflow-hidden border-2 transition ${
                                    selectedImageId === filename
                                        ? "border-primary border-3 scale-95 bg-primary-subtle/20"
                                        : "border-admin-border hover:border-primary"
                                }`}
                                type="button"
                            >
                                <img
                                    src={`${IMAGE_BASE_URL}thumbnails/${filename}`}
                                    className="w-full h-full object-cover"
                                    alt={filename}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `${IMAGE_BASE_URL}${filename}`;
                                    }}
                                />
                                {selectedImageId === filename && (
                                    <div className="absolute top-1 right-1 bg-primary rounded-full p-1 shadow-md">
                                        <Check className="w-3 h-3 text-white"/>
                                    </div>
                                )}
                                <div
                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-end p-1 transition">
                                    <span className="text-[10px] truncate w-full text-white">
                                        {filename}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {enablePagination && canLoadMore && (
                        <div className="flex justify-center pt-2">
                            <Button
                                variant="secondary"
                                onClick={handleLoadMore}
                                disabled={isLoading}
                                className="w-full"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader className="w-4 h-4 animate-spin mr-2"/>
                                        Loading...
                                    </>
                                ) : (
                                    `Load More (${images.length} of ${totalCount})`
                                )}
                            </Button>
                        </div>
                    )}

                    {enablePagination && !canLoadMore && images.length > 0 && totalCount > 0 && (
                        <p className="text-xs text-admin-text-muted text-center pt-2">
                            Showing {images.length} of {totalCount} images
                        </p>
                    )}
                </>
            )}
        </div>
    );
};


