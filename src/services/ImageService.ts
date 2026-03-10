import ApiService from './RestApiService';

interface ImageUploadResponse {
  fileName: string;
}

interface BulkImageUploadResponse {
  uploaded: string[];
  skipped: string[];
}

const ImageService = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return ApiService.fetchDataWithAxios<ImageUploadResponse, FormData>({
      url: '/admin/images/upload',
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  uploadProductImage: (file: File, productId: string) => {
    const formData = new FormData();
    formData.append('file', file);

    return ApiService.fetchDataWithAxios<ImageUploadResponse, FormData>({
      url: `/admin/images/upload/product/${productId}`,
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  uploadCategoryImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return ApiService.fetchDataWithAxios<ImageUploadResponse, FormData>({
      url: '/admin/images/upload/category',
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  uploadBrandImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return ApiService.fetchDataWithAxios<ImageUploadResponse, FormData>({
      url: '/admin/images/upload/brand',
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  bulkUploadImages: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    return ApiService.fetchDataWithAxios<BulkImageUploadResponse, FormData>({
      url: '/admin/images/bulk-upload',
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  fetchImageFilenames: () => { // Corrected syntax for object method
    return ApiService.fetchDataWithAxios<string[]>({
      url: '/admin/images/image-list', // ApiService will prepend API_BASE_URL
      method: 'GET',
    });
  },
};

export default ImageService;
