import { requestGraphQL } from "../../requester";
import {
  ALL_CATEGORIES_QUERY,
  CATEGORY_BY_ID_QUERY,
  CREATE_CATEGORY_MUTATION,
  DELETE_CATEGORY_MUTATION,
  UPDATE_CATEGORY_MUTATION,
} from "./category.queries";
import type {
  AllCategoriesResponse,
  CategoryData,
  CategoryResponse,
  CreateCategoryResponse,
  UpdateCategoryResponse,
} from "./category.types";

export async function getAllCategories(): Promise<CategoryData[]> {
  const response = await requestGraphQL<AllCategoriesResponse>(ALL_CATEGORIES_QUERY);
  return response.allCategories || [];
}

export async function getCategoryById(id: number): Promise<CategoryData> {
  const response = await requestGraphQL<CategoryResponse, { id: number }>(CATEGORY_BY_ID_QUERY, { id });
  return response.category;
}

export async function createCategory(category: Partial<CategoryData>): Promise<CategoryData> {
  const response = await requestGraphQL<CreateCategoryResponse, { category: Partial<CategoryData> }>(
    CREATE_CATEGORY_MUTATION,
    { category },
  );

  return response.createCategory;
}

export async function updateCategory(category: Partial<CategoryData>): Promise<CategoryData> {
  const response = await requestGraphQL<UpdateCategoryResponse, { category: Partial<CategoryData> }>(
    UPDATE_CATEGORY_MUTATION,
    { category },
  );

  return response.updateCategory;
}

export async function deleteCategory(id: number): Promise<void> {
  await requestGraphQL(DELETE_CATEGORY_MUTATION, { id });
}

