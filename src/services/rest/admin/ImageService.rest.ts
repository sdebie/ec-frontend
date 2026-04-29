import ApiService from '../RestApiService.ts';

interface ImageUploadResponse {
  fileName: string;
}

interface BulkImageUploadResponse {
  uploaded: number;
  skipped: number;
}

const ImageServiceRest = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return ApiService.fetchDataWithAxios<ImageUploadResponse, FormData>({
      url: '/admin/images/upload',
      method: 'POST',
      data: formData,
    });
  },

  uploadProductVariantImage: (file: File, productVariantId: string) => {
    const formData = new FormData();
    formData.append('file', file);

    return ApiService.fetchDataWithAxios<ImageUploadResponse, FormData>({
      url: `/admin/images/upload/product-variant/${productVariantId}`,
      method: 'POST',
      data: formData,
    });
  },

  uploadCategoryImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return ApiService.fetchDataWithAxios<ImageUploadResponse, FormData>({
      url: '/admin/images/upload/category',
      method: 'POST',
      data: formData,
    });
  },

  uploadBrandImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return ApiService.fetchDataWithAxios<ImageUploadResponse, FormData>({
      url: '/admin/images/upload/brand',
      method: 'POST',
      data: formData,
    });
  },

  bulkUploadImages: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    return ApiService.fetchDataWithAxios<BulkImageUploadResponse, FormData>({
      url: '/admin/images/bulk-upload',
      method: 'POST',
      data: formData,
    });
  },

  fetchImageFilenames: () => { // Corrected syntax for object method
    return ApiService.fetchDataWithAxios<string[]>({
      url: '/admin/images/image-list', // ApiService will prepend API_BASE_URL
      method: 'GET',
    });
  },
};

export default ImageServiceRest;
