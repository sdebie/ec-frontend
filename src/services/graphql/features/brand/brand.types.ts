export type SearchRequest = {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
  searchText?: string;
};

export type Brand = {
  id: string;
  name: string;
  description?: string | null;
  slug?: string | null;
  logoUrl?: string | null;
};

export type BrandInput = Omit<Brand, "id"> & {
  id?: string;
};

export type AllBrandsResponse = {
  allBrands: Brand[];
};

export type BrandByIdResponse = {
  brand: Brand;
};

