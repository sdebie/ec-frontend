import ApiService from './RestApiService';

interface ImageUploadResponse {
  fileName: string;
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
};

export default ImageService;
