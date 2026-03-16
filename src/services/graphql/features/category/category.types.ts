export type CategoryData = {
  id: number;
  name: string;
  description: string;
  parent: CategoryData;
  children: CategoryData[];
};

export type AllCategoriesResponse = {
  allCategories: CategoryData[];
};

export type CategoryResponse = {
  category: CategoryData;
};

export type CreateCategoryResponse = {
  createCategory: CategoryData;
};

export type UpdateCategoryResponse = {
  updateCategory: CategoryData;
};

