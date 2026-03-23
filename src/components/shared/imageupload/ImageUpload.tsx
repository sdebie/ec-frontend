import React, { useState, useRef } from 'react';
import { clsx } from 'clsx';
import { Button } from '../button/Button';
import ImageService from '@/services/ImageService';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadByType = async (file: File) => {
    if (type === 'product') {
      if (productVariantId) {
        return ImageService.uploadProductVariantImage(file, productVariantId);
      }
      // Fallback keeps generic product uploads working in screens that do not have a variant context yet.
      return ImageService.uploadImage(file);
    }
    if (type === 'category') {
      return ImageService.uploadCategoryImage(file);
    }
    return ImageService.uploadBrandImage(file);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    try {
      setIsLoading(true);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      const response = await uploadByType(file);
      onImageUpload(response.fileName);
    } catch (err) {
      setError('Failed to upload image. Please try again.');
      console.error('Image upload error:', err);
      setPreviewUrl(currentImageUrl);
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    try {
      setIsLoading(true);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
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

  return (
    <div className={clsx('w-full', className)}>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>

      <div className="space-y-4">
        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={clsx(
            'relative border-2 border-dashed rounded-lg p-6 transition-colors',
            {
              'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 cursor-pointer':
                !disabled && !isLoading,
              'border-slate-200 bg-slate-50 cursor-not-allowed opacity-50': disabled || isLoading,
            }
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled || isLoading}
            className="hidden"
            aria-label="Upload image file"
          />

          <div
            onClick={() => !disabled && !isLoading && fileInputRef.current?.click()}
            className={clsx({
              'cursor-pointer': !disabled && !isLoading,
            })}
          >
            <div className="text-center">
              <div className="text-slate-400 mb-2">
                <svg
                  className="mx-auto h-12 w-12"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-4-8l-8-8m0 0l-8 8m8-8v20"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-sm text-slate-600">
                <span className="font-medium text-slate-900">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-slate-500 mt-1">
                PNG, JPG, GIF up to 5MB ({type})
              </p>
            </div>
          </div>
        </div>

        {/* Preview */}
        {previewUrl && (
          <div className="relative">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Preview
            </label>
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-xs h-auto rounded-lg border border-slate-200"
              />
              {isLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {!error && previewUrl && !isLoading && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">Image uploaded successfully</p>
          </div>
        )}

        {/* Clear Button */}
        {previewUrl && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setPreviewUrl(undefined);
              setError(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            disabled={isLoading}
          >
            Clear Image
          </Button>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;

