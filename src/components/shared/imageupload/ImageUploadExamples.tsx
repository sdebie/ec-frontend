import React, { useState } from 'react';
import ImageUpload from '@/components/shared/imageupload/ImageUpload';

/**
 * Example usage of ImageUpload component for products
 */
export const ProductImageExample: React.FC = () => {
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  const handleProductImageUpload = (fileName: string) => {
    setUploadedFileName(fileName);
    console.log('Product image uploaded:', fileName);
    // Save fileName to your product form data
  };

  return (
    <ImageUpload
      type="product"
      onImageUpload={handleProductImageUpload}
      label="Product Image"
      currentImageUrl={uploadedFileName ? `/images/products/${uploadedFileName}` : undefined}
    />
  );
};

/**
 * Example usage of ImageUpload component for categories
 */
export const CategoryImageExample: React.FC = () => {
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  const handleCategoryImageUpload = (fileName: string) => {
    setUploadedFileName(fileName);
    console.log('Category image uploaded:', fileName);
    // Save fileName to your category form data
  };

  return (
    <ImageUpload
      type="category"
      onImageUpload={handleCategoryImageUpload}
      label="Category Image"
      currentImageUrl={uploadedFileName ? `/images/categories/${uploadedFileName}` : undefined}
    />
  );
};

/**
 * Example usage of ImageUpload component for brands
 */
export const BrandImageExample: React.FC = () => {
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  const handleBrandImageUpload = (fileName: string) => {
    setUploadedFileName(fileName);
    console.log('Brand image uploaded:', fileName);
    // Save fileName to your brand form data
  };

  return (
    <ImageUpload
      type="brand"
      onImageUpload={handleBrandImageUpload}
      label="Brand Logo"
      currentImageUrl={uploadedFileName ? `/images/brands/${uploadedFileName}` : undefined}
    />
  );
};

