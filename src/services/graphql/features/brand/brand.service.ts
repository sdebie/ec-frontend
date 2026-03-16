import { requestGraphQL } from "../../requester";
import {
  ALL_BRANDS_QUERY,
  BRAND_BY_ID_QUERY,
  CREATE_BRAND_MUTATION,
  DELETE_BRAND_MUTATION,
  UPDATE_BRAND_MUTATION,
} from "./brand.queries";
import type { AllBrandsResponse, Brand, BrandByIdResponse, BrandInput, SearchRequest } from "./brand.types";

export async function getAllBrands(searchRequest?: SearchRequest): Promise<Brand[]> {
  const response = await requestGraphQL<AllBrandsResponse, { searchRequest?: SearchRequest }>(
    ALL_BRANDS_QUERY,
    { searchRequest },
  );

  return response.allBrands || [];
}

export async function getBrandById(id: string): Promise<Brand> {
  const response = await requestGraphQL<BrandByIdResponse, { id: string }>(BRAND_BY_ID_QUERY, { id });
  return response.brand;
}

export async function createBrand(brandDto: BrandInput): Promise<void> {
  await requestGraphQL(CREATE_BRAND_MUTATION, { brandDto });
}

export async function updateBrand(id: string, brandDto: BrandInput): Promise<void> {
  await requestGraphQL(UPDATE_BRAND_MUTATION, { id, brandDto });
}

export async function deleteBrand(id: string): Promise<void> {
  await requestGraphQL(DELETE_BRAND_MUTATION, { id });
}

