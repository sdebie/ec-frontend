import {clsx} from 'clsx';
import {CheckCircle2, ImageIcon, UploadCloud, X} from 'lucide-react';
import React, {useEffect, useRef, useState} from 'react';
import ImageServiceRest from '@/services/rest/admin/ImageService.rest.ts';

export type ImageType = 'product' | 'category' | 'brand';

export interface ImageUploadProps {
    /**
     * Type of image being uploaded
     */
    type: ImageType;
    /**
     * Callback when image is successfully uploaded
     */
    onImageUpload: (fileName: string) => void;
    /**
     * Currently displayed image URL (optional)
     */
    currentImageUrl?: string;
    /**
     * Custom label for the upload area
     */
    label?: string;
    /**
     * Whether the component is disabled
     */
    disabled?: boolean;
    /**
     * Custom CSS class
     */
    className?: string;
    /**
     * Required for type='product' when image should be linked to a specific variant.
     */
    productVariantId?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
                                                            type,
                                                            onImageUpload,
                                                            currentImageUrl,
                                                            label = 'Upload Image',
                                                            disabled = false,
                                                            className,
                                                            productVariantId,
                                                        }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImageUrl);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync the preview whenever the parent updates currentImageUrl (e.g. when
    // BrandEditor calls reset() after the dialog opens, or when the user switches
    // to a different brand). useState() only captures the *initial* value on
    // mount, so without this effect any later prop change is silently ignored.
    useEffect(() => {
        if (!isLoading) {
            // Only sync when we are not mid-upload; during an upload the local
            // blob URL is the optimistic preview and must not be overwritten.
            setPreviewUrl(currentImageUrl);
        }
    }, [currentImageUrl]); // eslint-disable-line react-hooks/exhaustive-deps

    const uploadByType = async (file: File) => {
        if (type === 'product') {
            if (productVariantId) {
                return ImageServiceRest.uploadProductVariantImage(file, productVariantId);
            }
            return ImageServiceRest.uploadImage(file);
        }
        if (type === 'category') {
            return ImageServiceRest.uploadCategoryImage(file);
        }
        return ImageServiceRest.uploadBrandImage(file);
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setError(null);

        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB');
            return;
        }

        try {
            setIsLoading(true);

            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewUrl(e.target?.result as string);
            };
            reader.readAsDataURL(file);

            const response = await uploadByType(file);
            onImageUpload(response.fileName);
        } catch (err) {
            setError('Failed to upload image. Please try again.');
            console.error('Image upload error:', err);
            setPreviewUrl(currentImageUrl);
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        setError(null);

        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB');
            return;
        }

        try {
            setIsLoading(true);

            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewUrl(e.target?.result as string);
            };
            reader.readAsDataURL(file);

            const response = await uploadByType(file);
            onImageUpload(response.fileName);
        } catch (err) {
            setError('Failed to upload image. Please try again.');
            console.error('Image upload error:', err);
            setPreviewUrl(currentImageUrl);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setPreviewUrl(undefined);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={clsx('w-full', className)}>
            <label className="block text-sm font-medium text-(--c-text) mb-3">
                {label}
            </label>

            {/* Always-present hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={disabled || isLoading}
                className="hidden"
                aria-label="Upload image file"
            />

            <div className="space-y-3">

                {/* ── Dropzone (shown when no image is selected) ── */}
                {!previewUrl && (
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => !disabled && !isLoading && fileInputRef.current?.click()}
                        role="button"
                        tabIndex={disabled || isLoading ? -1 : 0}
                        onKeyDown={(e) => {
                            if ((e.key === 'Enter' || e.key === ' ') && !disabled && !isLoading) {
                                e.preventDefault();
                                fileInputRef.current?.click();
                            }
                        }}
                        aria-label="Upload image"
                        className={clsx(
                            'flex flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all duration-200 outline-none',
                            {
                                'border-(--c-border) hover:border-primary hover:bg-primary-subtle/20 cursor-pointer focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30':
                                    !disabled && !isLoading && !isDragging,
                                'border-primary bg-primary-subtle/25 scale-[1.01] cursor-copy':
                                    isDragging && !disabled && !isLoading,
                                'border-(--c-border) cursor-not-allowed opacity-40':
                                    disabled || isLoading,
                            }
                        )}
                    >
                        {/* Icon badge */}
                        <div className={clsx(
                            'flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-200',
                            isDragging
                                ? 'bg-primary-subtle text-primary'
                                : 'bg-(--c-border)/60 text-(--c-text-muted)'
                        )}>
                            <UploadCloud className="h-5 w-5"/>
                        </div>

                        {/* Copy */}
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-(--c-text) leading-snug">
                                {isDragging
                                    ? 'Drop to upload'
                                    : (
                                        <>
                                            Click to upload{' '}
                                            <span className="font-normal text-(--c-text-muted)">or drag and drop</span>
                                        </>
                                    )
                                }
                            </p>
                            <p className="text-xs text-(--c-text-muted)">PNG, JPG, GIF · max 5 MB</p>
                        </div>
                    </div>
                )}

                {/* ── Preview card (shown once an image is chosen) ── */}
                {previewUrl && (
                    <div className="overflow-hidden rounded-xl border border-(--c-border) bg-(--c-panel)">

                        {/* Card header */}
                        <div className="flex items-center justify-between border-b border-(--c-border) px-3 py-2">
                            <div className="flex items-center gap-1.5 text-xs text-(--c-text-muted)">
                                <ImageIcon className="h-3.5 w-3.5 shrink-0"/>
                                <span className="font-medium">Preview</span>
                                {!error && !isLoading && (
                                    <span className="ml-1 inline-flex items-center gap-1 text-emerald-500">
                                        <CheckCircle2 className="h-3 w-3"/>
                                        Uploaded
                                    </span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={handleClear}
                                disabled={isLoading}
                                aria-label="Remove image"
                                className="rounded-md p-1 text-(--c-text-muted) transition-colors hover:bg-(--c-bg) hover:text-(--c-text) disabled:pointer-events-none disabled:opacity-40"
                            >
                                <X className="h-3.5 w-3.5"/>
                            </button>
                        </div>

                        {/* Image body */}
                        <div className="relative flex items-center justify-center bg-(--c-bg)/40 p-4 min-h-32">
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="max-h-48 max-w-full rounded-lg object-contain"
                            />
                            {isLoading && (
                                <div
                                    className="absolute inset-0 flex items-center justify-center bg-(--c-panel)/70 backdrop-blur-sm">
                                    <div
                                        className="h-6 w-6 animate-spin rounded-full border-2 border-(--c-border) border-t-primary"/>
                                </div>
                            )}
                        </div>

                        {/* Replace action */}
                        {!isLoading && (
                            <div className="border-t border-(--c-border) px-3 py-2.5">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={disabled}
                                    className="w-full rounded-lg border border-dashed border-(--c-border) py-1.5 text-xs font-medium text-(--c-text-muted) transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40"
                                >
                                    Replace image
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Error message ── */}
                {error && (
                    <div
                        className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5">
                        <span className="mt-0.5 shrink-0 text-xs font-bold leading-none text-red-400">!</span>
                        <p className="text-xs leading-relaxed text-red-400">{error}</p>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ImageUpload;

