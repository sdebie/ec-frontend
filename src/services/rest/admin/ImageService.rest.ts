import getServiceEndpoint from "../../../utils/HostnameResolver";

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

const baseUrl = getServiceEndpoint(8080) || '/api';

const ImageServiceRest = {
  uploadImage: async (file: File): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${baseUrl}/admin/images/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  },

  uploadProductVariantImage: async (file: File, productVariantId: string): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${baseUrl}/admin/images/upload/product-variant/${productVariantId}`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  },

  uploadCategoryImage: async (file: File): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${baseUrl}/admin/images/upload/category`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  },

  uploadBrandImage: async (file: File): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${baseUrl}/admin/images/upload/brand`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  },

  bulkUploadImages: async (files: File[], options?: BulkImageUploadOptions): Promise<BulkImageUploadResponse> => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    formData.append('destinationDirectory', options?.destinationDirectory?.trim() ?? '');

    const res = await fetch(`${baseUrl}/admin/images/bulk-upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  },

  fetchImageDirectories: async (): Promise<string[]> => {
    const res = await fetch(`${baseUrl}/admin/images/directories`, {
      method: 'GET',
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  },

  fetchImageFilenames: async (): Promise<string[]> => {
    const res = await fetch(`${baseUrl}/admin/images/image-list`, {
      method: 'GET',
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  },

  fetchImageFilenamesPaginated: async (
    page = 0,
    pageSize = 30,
    search = ''
  ): Promise<PaginatedImageFilenamesResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      search,
    });
    const res = await fetch(`${baseUrl}/admin/images/image-list/paginated?${params}`, {
      method: 'GET',
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  },
};

export default ImageServiceRest;
