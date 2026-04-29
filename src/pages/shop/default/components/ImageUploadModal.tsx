import React, { useState } from 'react';
import ImageUpload from '../../../../components/shared/imageupload/ImageUpload.tsx';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageUpload: (fileName: string) => void;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({ isOpen, onClose, onImageUpload }) => {
  const [selectedImageType, setSelectedImageType] = useState<'product' | 'category' | 'brand'>('product');

  const handleImageUpload = (fileName: string) => {
    console.log(`Image uploaded for ${selectedImageType}:`, fileName);
    onImageUpload(fileName);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Upload Image</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-4">
          {/* Image Type Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image Type
            </label>
            <div className="flex gap-3">
              {(['product', 'category', 'brand'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedImageType(type)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedImageType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* ImageUpload Component */}
          <ImageUpload
            type={selectedImageType}
            onImageUpload={handleImageUpload}
            label={`${selectedImageType.charAt(0).toUpperCase() + selectedImageType.slice(1)} Image`}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;

