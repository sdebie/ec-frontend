import ApiService from '../RestApiService.ts';

interface ImageUploadResponse {
  fileName: string;
}

interface BulkImageUploadResponse {
  uploaded: number;
  skipped: number;
}

interface BulkImageUploadOptions {
  destinationDirectory?: string;
}

interface PaginatedImageFilenamesResponse {
  images: string[];
  totalCount: number;
  page: number;
  pageSize: number;
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

  bulkUploadImages: (files: File[], options?: BulkImageUploadOptions) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    formData.append('destinationDirectory', options?.destinationDirectory?.trim() ?? '');

    return ApiService.fetchDataWithAxios<BulkImageUploadResponse, FormData>({
      url: '/admin/images/bulk-upload',
      method: 'POST',
      data: formData,
    });
  },

  fetchImageDirectories: () => {
    return ApiService.fetchDataWithAxios<string[]>({
      url: '/admin/images/directories',
      method: 'GET',
    });
  },

  fetchImageFilenames: () => { // Corrected syntax for object method
    return ApiService.fetchDataWithAxios<string[]>({
      url: '/admin/images/image-list', // ApiService will prepend API_BASE_URL
      method: 'GET',
    });
  },

  fetchImageFilenamesPaginated: async (
    page = 0,
    pageSize = 30,
    search = ''
  ): Promise<PaginatedImageFilenamesResponse> => {
    return ApiService.fetchDataWithAxios<PaginatedImageFilenamesResponse>({
      url: '/admin/images/image-list/paginated',
      method: 'GET',
      params: {
        page,
        pageSize,
        search,
      },
    });
  },
};

export default ImageServiceRest;
